import { submitBlessingStarFn } from "@/lib/blessing-stars.functions";
import { getSupabase } from "@/lib/supabase";
import {
  normalizeFamilySide,
  normalizeMembers,
  normalizeStarColor,
  normalizeStarCount,
  type BlessingStar,
  type ClusterMember,
  type FamilySide,
} from "@/lib/blessing-stars";

export type { BlessingStar, ClusterMember, FamilySide };

function normalizeStar(row: Record<string, unknown>): BlessingStar {
  const rawColor =
    (typeof row.color === "string" && row.color) ||
    (typeof row.hue === "string" && row.hue) ||
    "#D4AF37";
  const color = normalizeStarColor(rawColor);
  const name = String(row.name ?? "");
  const members = normalizeMembers(row.members, {
    starCount: row.star_count,
    clusterName: name,
    clusterColor: color,
  });

  return {
    id: String(row.id),
    name,
    message: String(row.message ?? ""),
    color,
    star_count: members.length || normalizeStarCount(row.star_count),
    members,
    family_side: normalizeFamilySide(row.family_side),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function fetchBlessingStars(): Promise<BlessingStar[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blessing_stars")
    .select("id, name, message, color, star_count, members, family_side, created_at")
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    // Older / incomplete schema — try fewer columns, then give a clear hint
    const fallback = await supabase
      .from("blessing_stars")
      .select("id, name, message, color, created_at")
      .order("created_at", { ascending: true })
      .limit(200);
    if (fallback.error) {
      console.warn(
        "Could not load blessing stars:",
        error.message,
        "→ Run supabase/blessing-stars-fix.sql in the Supabase SQL Editor, then retry.",
      );
      return [];
    }
    console.warn(
      "blessing_stars is missing newer columns (family_side / members).",
      "Run supabase/blessing-stars-fix.sql in Supabase SQL Editor.",
    );
    return (fallback.data ?? []).map((row) => normalizeStar(row as Record<string, unknown>));
  }

  return (data ?? []).map((row) => normalizeStar(row as Record<string, unknown>));
}

export async function submitBlessingStar(input: {
  name: string;
  message?: string;
  color?: string;
  family_side?: FamilySide;
  members: ClusterMember[];
}): Promise<BlessingStar> {
  const members = normalizeMembers(input.members, {
    clusterName: input.name,
    clusterColor: input.color,
  }).filter((m) => m.name.trim().length > 0);

  if (members.length < 1) {
    throw new Error("Add at least one named star to your cluster.");
  }

  const result = await submitBlessingStarFn({
    data: {
      name: input.name,
      message: input.message ?? "",
      color: normalizeStarColor(input.color),
      family_side: normalizeFamilySide(input.family_side),
      members: members.map((m) => ({
        name: m.name,
        personality: m.personality,
        ...(m.color ? { color: normalizeStarColor(m.color) } : {}),
      })),
    },
  });
  return normalizeStar(result.star as Record<string, unknown>);
}
