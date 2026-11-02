import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  FAMILY_SIDES,
  MAX_CLUSTER_STARS,
  MIN_CLUSTER_STARS,
} from "@/lib/blessing-stars";
import { sanitizePlainText } from "@/lib/security";

const memberSchema = z.object({
  name: z.string().max(80).transform(sanitizePlainText).pipe(z.string().min(1).max(40)),
  personality: z.string().max(120).default("").transform(sanitizePlainText).pipe(z.string().max(80)),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .transform((v) => v.toUpperCase())
    .optional(),
});

const blessingInput = z.object({
  name: z.string().max(120).transform(sanitizePlainText).pipe(z.string().min(1).max(60)),
  message: z.string().max(400).default("").transform(sanitizePlainText).pipe(z.string().max(280)),
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
  // Publishable / anon only — never fall back to the service role key.
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured on the server.");
  }

  if (looksLikeServiceRoleKey(key)) {
    throw new Error("Refusing to use a Supabase service-role key on this path.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Reject accidental service-role wiring — inserts must go through RLS as anon. */
function looksLikeServiceRoleKey(key: string): boolean {
  if (key.includes("service_role")) return true;
  const parts = key.split(".");
  if (parts.length !== 3) return false;
  try {
    const json = atob(parts[1]!.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { role?: string };
    return payload.role === "service_role";
  } catch {
    return false;
  }
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
      console.error("Blessing star insert failed:", error.code ?? error.message);
      throw new Error("Could not place your star. Please try again.");
    }

    return { ok: true as const, star: row };
  });
