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

export type SkyLayout = "banner" | "explore";

/** Black-hole anchor in normalized viewport space (matches CosmicBackground). */
export const SKY_HOLE = { nx: 0.68, ny: 0.55 } as const;

/**
 * Place clusters by family side.
 * - banner: upper sky (behind home-page content), clear of the hole
 * - explore: far ring around the hole so zooming feels like a journey
 */
export function clusterAnchor(
  id: string,
  side: FamilySide = "nichols",
  layout: SkyLayout = "banner",
): { nx: number; ny: number } {
  const h = hashString(id);

  if (layout === "explore") {
    // Family-side wedges around the hole (radians from +x)
    const sector =
      side === "rentz"
        ? { a0: -0.95, span: 1.45 } // east / northeast
        : side === "chosen"
          ? { a0: 0.45, span: 2.0 } // south
          : { a0: 2.05, span: 1.55 }; // west / northwest
    const ang = sector.a0 + ((h % 1000) / 1000) * sector.span;
    // Far orbit — past the first viewport edge so pan+zoom reads as travel
    const dist = 1.05 + (((h >>> 10) % 1000) / 1000) * 0.9; // 1.05–1.95
    return {
      nx: SKY_HOLE.nx + Math.cos(ang) * dist,
      ny: SKY_HOLE.ny + Math.sin(ang) * dist * 0.72,
    };
  }

  // Homepage banner: keep in the upper sky, away from the hole at ~0.68×0.55
  const band =
    side === "rentz"
      ? { min: 0.72, span: 0.24 }
      : side === "chosen"
        ? { min: 0.38, span: 0.28 }
        : { min: 0.04, span: 0.3 };
  const nx = band.min + ((h % 1000) / 1000) * band.span;
  const ny = 0.04 + (((h >>> 10) % 1000) / 1000) * 0.28;
  return { nx, ny };
}

/** Per-cluster orbital plane — tilted like the marriage binary. */
export function clusterOrbitMeta(clusterId: string): {
  incline: number;
  planeRot: number;
  phase: number;
} {
  const seed = hashString(clusterId);
  return {
    incline: 0.3 + ((seed % 80) / 80) * 0.28,
    planeRot: ((seed >>> 7) % 1000) / 1000 * Math.PI * 2,
    phase: ((seed >>> 3) % 1000) / 1000 * Math.PI * 2,
  };
}

/**
 * Member position in an inclined coplanar orbit (spread units).
 * Every cluster shares the same spin clock so the sky turns in harmony.
 */
export function memberLocalOffset(
  clusterId: string,
  index: number,
  count: number,
  spin = 0,
): { dx: number; dy: number; ang: number; rad: number; incline: number; planeRot: number } {
  const { incline, planeRot, phase } = clusterOrbitMeta(clusterId);
  const bit = hashString(`${clusterId}:${index}`);

  if (count <= 1) {
    return { dx: 0, dy: 0, ang: spin + phase, rad: 0, incline, planeRot };
  }

  // Soft wide↔close breathing, shared tempo
  const breath = 0.82 + 0.18 * Math.sin(spin * 0.65 + phase);

  // Binaries sit opposite — dance partners. Larger families share the ring.
  const ang =
    count === 2
      ? spin + phase + index * Math.PI
      : spin + phase + (index / count) * Math.PI * 2 + ((bit % 40) / 40 - 0.5) * 0.1;

  const radBase =
    count === 2 ? 0.9 : 0.42 + ((bit >>> 8) % 1000) / 1000 * 0.58;
  const rad = radBase * breath;

  const x = Math.cos(ang) * rad;
  const y = Math.sin(ang) * rad * incline;
  const ca = Math.cos(planeRot);
  const sa = Math.sin(planeRot);
  return {
    dx: x * ca - y * sa,
    dy: x * sa + y * ca,
    ang,
    rad,
    incline,
    planeRot,
  };
}

/** Shared sky clock (radians). All family systems orbit on this beat. */
export function clusterSpinRadians(nowMs = Date.now()): number {
  // ~7°/s — gentle, readable, same tempo as the marriage binary’s leisure feel
  return (nowMs / 1000) * 0.12;
}

export function clusterSpread(width: number, height: number, count: number): number {
  return Math.min(width, height) * (0.014 + Math.min(count, 16) * 0.00125);
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
