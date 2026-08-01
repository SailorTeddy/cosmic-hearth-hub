import { useEffect, useRef, useState, type FormEvent } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MagneticButton } from "@/components/glass";
import {
  COLOR_PRESETS,
  FAMILY_SIDE_HINTS,
  FAMILY_SIDE_LABELS,
  FAMILY_SIDES,
  MAX_CLUSTER_STARS,
  MIN_CLUSTER_STARS,
  PERSONALITY_PRESETS,
  SIDE_DEFAULT_COLOR,
  colorToRgb,
  emptyMember,
  hashString,
  memberLocalOffset,
  normalizeStarColor,
  type BlessingStar,
  type ClusterMember,
  type FamilySide,
} from "@/lib/blessing-stars";
import { submitBlessingStar } from "@/lib/blessing-stars-api";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStarClaimed?: (star: BlessingStar) => void;
};

function StarPreview({
  color,
  name,
  members,
}: {
  color: string;
  name: string;
  members: ClusterMember[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const count = Math.max(1, members.length);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 220;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let t = 0;
    const seedKey = name.trim() || "preview";
    const seed = hashString(seedKey);

    const draw = () => {
      t += 0.016;
      ctx.fillStyle = "#020208";
      ctx.fillRect(0, 0, size, size);

      for (let i = 0; i < 40; i++) {
        const h = hashString(`field:${seed}:${i}`);
        const x = ((h % 1000) / 1000) * size;
        const y = (((h >>> 10) % 1000) / 1000) * size;
        const a = 0.15 + ((h >>> 20) % 50) / 100;
        ctx.fillStyle = `rgba(220,230,255,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.6 + (h % 3) * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      const cx = size * 0.5;
      const cy = size * 0.48;
      const pulse = 0.88 + 0.12 * Math.sin(t * 1.6);
      const spread = 12 + Math.min(count, 16) * 0.7;
      const [cr, cg, cb] = colorToRgb(color);

      ctx.globalCompositeOperation = "lighter";
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, spread * 2.8);
      halo.addColorStop(0, `rgba(${cr},${cg},${cb},${0.28 * pulse})`);
      halo.addColorStop(0.5, `rgba(${cr},${cg},${cb},${0.1 * pulse})`);
      halo.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, spread * 2.8, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < count; i++) {
        const member = members[i];
        const [r, g, b] = colorToRgb(member?.color || color);
        const off = memberLocalOffset(seedKey, i, count);
        const sx = cx + off.dx * spread;
        const sy = cy + off.dy * spread;
        const tw = 0.75 + 0.25 * Math.sin(t * (2.2 + i * 0.3) + i);
        const sr = 1.2;
        const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 5);
        core.addColorStop(0, `rgba(255,255,255,${0.95 * tw})`);
        core.addColorStop(0.4, `rgba(${r},${g},${b},${0.85 * tw})`);
        core.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(sx, sy, sr * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [color, name, members, count]);

  return (
    <div className="overflow-hidden rounded-xl border border-glass-border bg-black shadow-[0_0_40px_rgba(212,175,55,0.12)]">
      <canvas ref={canvasRef} className="mx-auto block" aria-hidden />
      <p className="border-t border-glass-border px-3 py-2 text-center text-xs text-muted-foreground">
        Preview — {count} named {count === 1 ? "star" : "stars"} in your cluster
      </p>
    </div>
  );
}

export function ClaimStarDialog({ open, onOpenChange, onStarClaimed }: Props) {
  const [clusterName, setClusterName] = useState("");
  const [starMessage, setStarMessage] = useState("");
  const [familySide, setFamilySide] = useState<FamilySide>("nichols");
  const [clusterColor, setClusterColor] = useState(SIDE_DEFAULT_COLOR.nichols);
  const [hexDraft, setHexDraft] = useState(SIDE_DEFAULT_COLOR.nichols);
  const [members, setMembers] = useState<ClusterMember[]>([
    emptyMember(SIDE_DEFAULT_COLOR.nichols),
  ]);
  const [confirmedGift, setConfirmedGift] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const reset = () => {
    setClusterName("");
    setStarMessage("");
    setFamilySide("nichols");
    setClusterColor(SIDE_DEFAULT_COLOR.nichols);
    setHexDraft(SIDE_DEFAULT_COLOR.nichols);
    setMembers([emptyMember(SIDE_DEFAULT_COLOR.nichols)]);
    setConfirmedGift(false);
    setClaiming(false);
  };

  const applyClusterColor = (value: string) => {
    const next = normalizeStarColor(value);
    setClusterColor(next);
    setHexDraft(next);
  };

  const pickSide = (side: FamilySide) => {
    setFamilySide(side);
    applyClusterColor(SIDE_DEFAULT_COLOR[side]);
  };

  const updateMember = (index: number, patch: Partial<ClusterMember>) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const addMember = () => {
    if (members.length >= MAX_CLUSTER_STARS) {
      toast.error(`Clusters can hold up to ${MAX_CLUSTER_STARS} stars.`);
      return;
    }
    setMembers((prev) => [...prev, emptyMember(clusterColor)]);
  };

  const removeMember = (index: number) => {
    if (members.length <= MIN_CLUSTER_STARS) {
      toast.error("Keep at least one star in the cluster.");
      return;
    }
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const claimStar = async (e: FormEvent) => {
    e.preventDefault();
    const name = clusterName.trim();
    if (!name) {
      toast.error("Add a name for your cluster.");
      return;
    }
    const cleaned = members
      .map((m) => ({
        name: m.name.trim(),
        personality: m.personality.trim(),
        color: m.color ? normalizeStarColor(m.color) : undefined,
      }))
      .filter((m) => m.name.length > 0);

    if (cleaned.length < 1) {
      toast.error("Give each star a name — add at least one.");
      return;
    }
    if (!confirmedGift) {
      toast.error("Confirm that you’ve sent a blessing first.");
      return;
    }

    setClaiming(true);
    try {
      const star = await submitBlessingStar({
        name,
        message: starMessage.trim(),
        color: clusterColor,
        family_side: familySide,
        members: cleaned,
      });
      onStarClaimed?.(star);
      toast.success("Your stars are in our sky.", {
        description: "Tap a glowing star near the top to meet them.",
      });
      onOpenChange(false);
      reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not place your star.";
      const needsKeys = /supabase is not configured/i.test(msg);
      const isLocal = typeof window !== "undefined" && /localhost|127\.0\.0\.1/.test(window.location.hostname);
      toast.error(needsKeys ? "Star sky isn’t connected yet." : msg, {
        description: needsKeys
          ? isLocal
            ? "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart npm run dev."
            : "Open the project in Lovable → edit the `.env` file with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (same as local) → Publish again. Anon keys are public; RLS protects the data."
          : msg.includes("schema cache") || msg.includes("family_side") || msg.includes("members")
            ? "Run supabase/blessing-stars-fix.sql in the Supabase SQL Editor."
            : undefined,
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-glass-border bg-background/95 text-foreground backdrop-blur-xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="gold-text text-xl">Design your blessing stars</DialogTitle>
          <DialogDescription>
            Name each star, give it a personality, pick your family side, then place the cluster
            after you’ve sent a gift.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={claimStar} className="space-y-4">
          <StarPreview color={clusterColor} name={clusterName || "preview"} members={members} />

          <fieldset>
            <legend className="mb-2 text-xs font-semibold tracking-wider text-champagne uppercase">
              Family side
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {FAMILY_SIDES.map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => pickSide(side)}
                  className={cn(
                    "rounded-lg border px-3 py-3 text-left transition-colors",
                    familySide === side
                      ? "border-gold/70 bg-gold/20 text-champagne"
                      : "border-glass-border bg-secondary/50 text-muted-foreground hover:text-champagne",
                  )}
                >
                  <span className="block text-sm font-semibold">{FAMILY_SIDE_LABELS[side]}</span>
                  <span className="mt-1 block text-[0.7rem] leading-snug opacity-80">
                    {FAMILY_SIDE_HINTS[side]}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block min-w-0 text-left">
            <span className="mb-1.5 block text-xs font-semibold tracking-wider text-champagne uppercase">
              Cluster name (household / family)
            </span>
            <input
              value={clusterName}
              onChange={(e) => setClusterName(e.target.value)}
              maxLength={60}
              required
              autoFocus
              placeholder="The Rivera family"
              className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-wider text-champagne uppercase">
                Stars in this cluster
              </p>
              <span className="text-xs tabular-nums text-gold">
                {members.length}/{MAX_CLUSTER_STARS}
              </span>
            </div>

            {members.map((member, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-glass-border bg-secondary/40 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gold">Star {index + 1}</p>
                  {members.length > MIN_CLUSTER_STARS && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-ember"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                <label className="block min-w-0 text-left">
                  <span className="mb-1 block text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
                    Name
                  </span>
                  <input
                    value={member.name}
                    onChange={(e) => updateMember(index, { name: e.target.value })}
                    maxLength={40}
                    required
                    placeholder="Aunt Kay"
                    className="w-full rounded-lg border border-glass-border bg-background/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  />
                </label>

                <label className="block min-w-0 text-left">
                  <span className="mb-1 block text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
                    Personality
                  </span>
                  <input
                    value={member.personality}
                    onChange={(e) => updateMember(index, { personality: e.target.value })}
                    maxLength={80}
                    placeholder="Warm hug energy"
                    className="w-full rounded-lg border border-glass-border bg-background/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  />
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {PERSONALITY_PRESETS.slice(0, 5).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateMember(index, { personality: preset })}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[0.65rem] transition-colors",
                        member.personality === preset
                          ? "border-gold/60 bg-gold/15 text-champagne"
                          : "border-glass-border text-muted-foreground hover:text-champagne",
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative size-8 shrink-0 cursor-pointer overflow-hidden rounded-full border border-white/25">
                    <span className="sr-only">
                      Click to edit color for {member.name || `star ${index + 1}`}
                    </span>
                    <input
                      type="color"
                      value={member.color || clusterColor}
                      onChange={(e) =>
                        updateMember(index, { color: normalizeStarColor(e.target.value) })
                      }
                      className="absolute inset-0 size-full cursor-pointer opacity-0"
                    />
                    <span
                      className="block size-full"
                      style={{ backgroundColor: member.color || clusterColor }}
                    />
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Click the color swatch to edit this star’s color
                  </span>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addMember}
              disabled={members.length >= MAX_CLUSTER_STARS}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gold/40 px-3 py-2.5 text-sm text-champagne transition-colors hover:border-gold/70 hover:bg-gold/10 disabled:opacity-40"
            >
              <Plus className="size-4" />
              Add another star
            </button>
          </div>

          <label className="block min-w-0 text-left">
            <span className="mb-1.5 block text-xs font-semibold tracking-wider text-champagne uppercase">
              Note for the whole cluster (optional)
            </span>
            <input
              value={starMessage}
              onChange={(e) => setStarMessage(e.target.value)}
              maxLength={280}
              placeholder="With love from afar"
              className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold tracking-wider text-champagne uppercase">
              Default cluster color
            </legend>
            <p className="mb-2 text-xs text-muted-foreground">
              Click the color swatch to edit — or type a hex code.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-full border border-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                <span className="sr-only">Click to edit cluster color</span>
                <input
                  type="color"
                  value={clusterColor}
                  onChange={(e) => applyClusterColor(e.target.value)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
                <span className="block size-full" style={{ backgroundColor: clusterColor }} />
              </label>
              <input
                value={hexDraft}
                onChange={(e) => {
                  const raw = e.target.value;
                  setHexDraft(raw);
                  if (/^#[0-9A-Fa-f]{6}$/.test(raw.trim())) applyClusterColor(raw);
                }}
                onBlur={() => applyClusterColor(hexDraft)}
                spellCheck={false}
                maxLength={7}
                aria-label="Hex color"
                className="w-28 rounded-lg border border-glass-border bg-background/40 px-3 py-2 font-mono text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-label={`Use color ${preset}`}
                  onClick={() => applyClusterColor(preset)}
                  className={cn(
                    "size-8 rounded-full border transition-transform hover:scale-110",
                    clusterColor === preset
                      ? "border-champagne ring-2 ring-gold/60"
                      : "border-white/20",
                  )}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
          </fieldset>

          <label className="flex cursor-pointer items-start gap-3 text-left text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={confirmedGift}
              onChange={(e) => setConfirmedGift(e.target.checked)}
              className="mt-1 size-4 accent-[var(--gold)]"
            />
            <span>
              I’ve sent a blessing (PayPal, Cash App, registry, or another gift). Place my stars in
              the Nichols sky.
            </span>
          </label>

          <MagneticButton
            type="submit"
            disabled={claiming}
            className="w-full bg-gold text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-gold-soft disabled:opacity-60"
          >
            <Sparkles className="size-4 shrink-0" />
            {claiming ? "Lighting stars…" : "Place my stars in the sky"}
          </MagneticButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
