import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  FAMILY_SIDES,
  MAX_CLUSTER_STARS,
  MIN_CLUSTER_STARS,
} from "@/lib/blessing-stars";

const memberSchema = z.object({
  name: z.string().trim().min(1).max(40),
  personality: z.string().trim().max(80).default(""),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .transform((v) => v.toUpperCase())
    .optional(),
});

const blessingInput = z.object({
  name: z.string().trim().min(1).max(60),
  message: z.string().trim().max(280).default(""),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Pick a valid color.")
    .transform((v) => v.toUpperCase())
    .default("#D4AF37"),
  family_side: z.enum(FAMILY_SIDES).default("nichols"),
  members: z.array(memberSchema).min(MIN_CLUSTER_STARS).max(MAX_CLUSTER_STARS),
});

function getServerSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // Lovable Cloud injects SUPABASE_ANON_KEY; local/dev often uses VITE_ / PUBLISHABLE_
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured on the server.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const submitBlessingStarFn = createServerFn({ method: "POST" })
  .validator(blessingInput)
  .handler(async ({ data }) => {
    const members = data.members.map((m) => ({
      name: m.name,
      personality: m.personality,
      ...(m.color ? { color: m.color } : {}),
    }));

    const supabase = getServerSupabase();
    const { data: row, error } = await supabase
      .from("blessing_stars")
      .insert({
        name: data.name,
        message: data.message,
        color: data.color,
        family_side: data.family_side,
        members,
        star_count: members.length,
      })
      .select("id, name, message, color, star_count, members, family_side, created_at")
      .single();

    if (error) {
      console.error("Blessing star insert failed:", error);
      throw new Error(error.message || "Could not place your star.");
    }

    return { ok: true as const, star: row };
  });
