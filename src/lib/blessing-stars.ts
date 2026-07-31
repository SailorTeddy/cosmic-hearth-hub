export const FAMILY_SIDES = ["rentz", "nichols", "chosen"] as const;
export type FamilySide = (typeof FAMILY_SIDES)[number];

export const FAMILY_SIDE_LABELS: Record<FamilySide, string> = {
  rentz: "Rentz",
  nichols: "Nichols",
  chosen: "Chosen family",
};

export const FAMILY_SIDE_HINTS: Record<FamilySide, string> = {
  rentz: "Monica’s people — the Rentz side",
  nichols: "Emmanuel’s people — the Nichols side",
  chosen: "Friends we love like family",
};

export const MIN_CLUSTER_STARS = 1;
export const MAX_CLUSTER_STARS = 24;
export const DEFAULT_CLUSTER_STARS = 3;

/** Quick personality vibes — free text still allowed. */
export const PERSONALITY_PRESETS = [
  "Warm & steady",
  "Playful spark",
  "Quiet strength",
  "Big-hearted",
  "Curious explorer",
  "Gentle light",
  "Bold & bright",
  "Soft wisdom",
  "Joy bringer",
  "Loyal guardian",
] as const;

export type ClusterMember = {
  /** Display name for this individual star */
  name: string;
  /** Short personality / vibe */
  personality: string;
  /** Optional personal color; falls back to cluster color */
  color?: string;
};

export type BlessingStar = {
  id: string;
  name: string;
  message: string;
  /** Hex color like #D4AF37 — default glow for the cluster */
  color: string;
  /** How many stars in this person’s cluster */
  star_count: number;
  /** Named stars inside the cluster */
  members: ClusterMember[];
  /** Which side of the family they belong to */
  family_side: FamilySide;
  created_at: string;
};

const LEGACY_NAMED: Record<string, string> = {
  gold: "#D4AF37",
  blue: "#6EA8FF",
  violet: "#A878FF",
  rose: "#FF8CBE",
  champagne: "#F0DCB9",
};

const LEGACY_SIDES: Record<string, FamilySide> = {
  monica: "rentz",
  emmanuel: "nichols",
  rentz: "rentz",
  nichols: "nichols",
  chosen: "chosen",
  external: "chosen",
  friend: "chosen",
  friends: "chosen",
};

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

export function normalizeStarColor(value: string | null | undefined): string {
  if (!value) return "#D4AF37";
  const trimmed = value.trim();
  if (HEX_RE.test(trimmed)) return trimmed.toUpperCase();
  const legacy = LEGACY_NAMED[trimmed.toLowerCase()];
  if (legacy) return legacy;
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;
  return "#D4AF37";
}

export function isValidStarColor(value: string): boolean {
  return HEX_RE.test(value.trim());
}

export function colorToRgb(color: string): [number, number, number] {
  const hex = normalizeStarColor(color).slice(1);
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

export function normalizeStarCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return DEFAULT_CLUSTER_STARS;
  return Math.min(MAX_CLUSTER_STARS, Math.max(MIN_CLUSTER_STARS, Math.round(n)));
}

export function normalizeFamilySide(value: unknown): FamilySide {
  const v = String(value ?? "")
    .toLowerCase()
    .trim();
  return LEGACY_SIDES[v] ?? "nichols";
}

export function emptyMember(color?: string): ClusterMember {
  return { name: "", personality: "", color: color ? normalizeStarColor(color) : undefined };
}

export function normalizeMembers(
  raw: unknown,
  opts?: { starCount?: unknown; clusterName?: string; clusterColor?: string },
): ClusterMember[] {
  const clusterColor = normalizeStarColor(opts?.clusterColor);
  const list = Array.isArray(raw) ? raw : [];

  const parsed: ClusterMember[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = String(row.name ?? "").trim().slice(0, 40);
    const personality = String(row.personality ?? "").trim().slice(0, 80);
    if (!name && !personality) continue;
    const colorRaw = typeof row.color === "string" ? row.color : undefined;
    parsed.push({
      name: name || "Unnamed star",
      personality,
      color: colorRaw ? normalizeStarColor(colorRaw) : undefined,
    });
  }

  if (parsed.length > 0) {
    return parsed.slice(0, MAX_CLUSTER_STARS);
  }

  // Legacy rows: invent placeholder members from star_count
  const count = normalizeStarCount(opts?.starCount ?? DEFAULT_CLUSTER_STARS);
  const label = (opts?.clusterName || "Star").trim() || "Star";
  return Array.from({ length: count }, (_, i) => ({
    name: count === 1 ? label : `${label} ${i + 1}`,
    personality: "",
    color: clusterColor,
  }));
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function clusterAnchor(id: string, side: FamilySide = "nichols"): { nx: number; ny: number } {
  const h = hashString(id);
  const band =
    side === "rentz"
      ? { min: 0.62, span: 0.31 }
      : side === "chosen"
        ? { min: 0.34, span: 0.32 }
        : { min: 0.07, span: 0.31 };
  const nx = band.min + ((h % 1000) / 1000) * band.span;
  const ny = 0.05 + (((h >>> 10) % 1000) / 1000) * 0.42;
  return { nx, ny };
}

/** Stable offset of a member star within a cluster (spread units). */
export function memberLocalOffset(
  clusterId: string,
  index: number,
  count: number,
): { dx: number; dy: number; ang: number; rad: number } {
  const bit = hashString(`${clusterId}:${index}`);
  const ang = ((bit % 1000) / 1000) * Math.PI * 2;
  const rad = 0.2 + ((bit >>> 8) % 1000) / 1000 * 0.95;
  // Single-star clusters sit on the jewel
  if (count <= 1) return { dx: 0, dy: 0, ang, rad: 0 };
  return {
    dx: Math.cos(ang) * rad,
    dy: Math.sin(ang) * rad * 0.72,
    ang,
    rad,
  };
}

export function clusterSpread(width: number, height: number, count: number): number {
  return Math.min(width, height) * (0.012 + Math.min(count, 16) * 0.0011);
}

export const COLOR_PRESETS = [
  "#D4AF37",
  "#6EA8FF",
  "#A878FF",
  "#FF8CBE",
  "#F0DCB9",
  "#7DFFB3",
  "#FF7A59",
  "#FFFFFF",
] as const;

export const SIDE_DEFAULT_COLOR: Record<FamilySide, string> = {
  nichols: "#6EA8FF",
  rentz: "#A878FF",
  chosen: "#D4AF37",
};
