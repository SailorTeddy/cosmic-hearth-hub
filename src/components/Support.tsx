import { useState, useMemo } from "react";
import { Copy, Check, ExternalLink, Heart, AlertCircle, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PAY_LINKS, PAYPAL_POOLS, QUICK_GIFTS, HOUSEWARMING_REGISTRY } from "@/config/site";
import { GlassCard, MagneticButton } from "@/components/glass";
import { ClaimStarDialog } from "@/components/ClaimStarDialog";
import type { BlessingStar } from "@/lib/blessing-stars";

const MIN_GIFT = 1;
const MAX_GIFT = 2500;

const amountSchema = z
  .string()
  .min(1, "Please enter an amount.")
  .refine((v) => /^\d+(\.\d{0,2})?$/.test(v), {
    message: "Enter a valid dollar amount (up to 2 decimals).",
  })
  .transform((v) => Number.parseFloat(v))
  .refine((n) => n >= MIN_GIFT, { message: `Minimum gift is $${MIN_GIFT}.` })
  .refine((n) => n <= MAX_GIFT, { message: `Maximum gift is $${MAX_GIFT.toLocaleString()}.` });

type Props = {
  onStarClaimed?: (star: BlessingStar) => void;
};

export function Support({ onStarClaimed }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [touched, setTouched] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);

  const parsed = useMemo(() => {
    const result = amountSchema.safeParse(custom);
    return result.success ? { ok: true, value: result.data, error: null } : { ok: false, value: null, error: result.error.errors[0]?.message ?? "Invalid amount" };
  }, [custom]);

  const showError = touched && !parsed.ok && custom.trim().length > 0;

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      toast.success("Copied", { description: value });
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast.error("Couldn't copy — long-press to copy manually.");
    }
  };

  return (
    <section id="support" className="mx-auto max-w-5xl scroll-mt-16 px-4 py-20 sm:px-6">
      <header className="mb-8 text-center">
        <h2 className="gold-text text-3xl font-bold sm:text-4xl">
          Support the Estate · Send a Blessing
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          No pressure and no expectations — truly. But if you'd like to chip into our family
          journey, send a gift, or cover a round of coffee, we appreciate you more than
          you know. 💛
        </p>
      </header>

      <GlassCard className="p-6 sm:p-9" tilt={false}>
        <a
          href={HOUSEWARMING_REGISTRY.href}
          target="_blank"
          rel="noreferrer noopener"
          className="group mb-8 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-gold/35 bg-secondary/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-[var(--shadow-glow)]"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-glass-border bg-background/40 text-gold">
            <Gift className="size-5" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-xs font-semibold tracking-widest text-gold uppercase">
              Housewarming
            </span>
            <span className="mt-1 block text-base font-semibold text-champagne">
              {HOUSEWARMING_REGISTRY.label}
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
              {HOUSEWARMING_REGISTRY.blurb}
            </span>
          </span>
          <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-gold" />
        </a>

        <h3 className="text-sm font-semibold tracking-widest text-gold uppercase">
          Quick gifting
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {QUICK_GIFTS.map((gift) => (
            <a
              key={gift.title}
              href={PAYPAL_POOLS.general}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-col rounded-lg border border-glass-border bg-secondary/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[var(--shadow-glow)]"
            >
              <span className="text-2xl font-extrabold text-champagne">
                {gift.amount > 0 ? `$${gift.amount}` : "You pick"}
              </span>
              <span className="mt-1 text-sm font-semibold text-gold">{gift.title}</span>
              <span className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {gift.blurb}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <div className="relative min-w-0">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <input
              id="custom-amount"
              inputMode="decimal"
              value={custom}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, "");
                const normalized = raw.replace(/\.(?=.*\.)/g, ""); // only one decimal point
                setCustom(normalized);
              }}
              onBlur={() => {
                setTouched(true);
                if (parsed.ok && parsed.value) {
                  setCustom(parsed.value.toFixed(2));
                }
              }}
              onFocus={() => setTouched(true)}
              placeholder={`${MIN_GIFT} – ${MAX_GIFT}`}
              aria-label="Custom gift amount"
              aria-invalid={showError}
              aria-describedby={showError ? "custom-amount-error" : "custom-amount-hint"}
              className={`w-full rounded-lg border bg-background/40 py-3 pr-4 pl-8 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                showError
                  ? "border-ember/70 focus-visible:border-ember"
                  : "border-glass-border"
              }`}
            />
            <span id="custom-amount-hint" className="sr-only">
              Enter an amount between ${MIN_GIFT} and ${MAX_GIFT.toLocaleString()}.
            </span>
            {showError && (
              <span
                id="custom-amount-error"
                className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-ember"
              >
                <AlertCircle className="size-3 shrink-0" />
                {parsed.error}
              </span>
            )}
          </div>
          {parsed.ok && parsed.value ? (
            <a
              href={`${PAYPAL_POOLS.general}&amount=${parsed.value.toFixed(2)}`}
              target="_blank"
              rel="noreferrer noopener"
              className="shrink-0"
            >
              <MagneticButton className="h-full bg-gold text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-gold-soft">
                <Heart className="size-4 shrink-0" />
                Send it
              </MagneticButton>
            </a>
          ) : (
            <MagneticButton
              type="button"
              disabled
              onClick={() => {
                setTouched(true);
                toast.error(parsed.error ?? "Enter a valid amount first.");
              }}
              className="h-full cursor-not-allowed bg-gold/60 text-primary-foreground opacity-50"
            >
              <Heart className="size-4 shrink-0" />
              Send it
            </MagneticButton>
          )}
        </div>

        <div className="my-8 h-px bg-[linear-gradient(90deg,transparent,var(--glass-border),transparent)]" />

        <h3 className="text-sm font-semibold tracking-widest text-gold uppercase">
          Or use your favorite app
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PAY_LINKS.map((link) =>
            link.copyOnly ? (
              <button
                key={link.handle}
                onClick={() => copy(link.handle)}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-glass-border bg-secondary/60 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50"
              >
                <span className="min-w-0">
                  <span className="block text-xs tracking-wider text-gold uppercase">
                    {link.label}
                  </span>
                  <span className="block truncate text-sm text-champagne">{link.handle}</span>
                </span>
                {copied === link.handle ? (
                  <Check className="size-4 shrink-0 text-gold" />
                ) : (
                  <Copy className="size-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            ) : (
              <a
                key={link.handle}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-glass-border bg-secondary/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50"
              >
                <span className="min-w-0">
                  <span className="block text-xs tracking-wider text-gold uppercase">
                    {link.label}
                  </span>
                  <span className="block truncate text-sm text-champagne">{link.handle}</span>
                </span>
                <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
              </a>
            ),
          )}
        </div>

        <div className="my-8 h-px bg-[linear-gradient(90deg,transparent,var(--glass-border),transparent)]" />

        <div className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-widest text-gold uppercase">
          <Sparkles className="size-4" />
          Claim your star
        </div>
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          After you send a blessing, open the star studio to design your cluster — name, color, and
          a short note — then place it in our sky. Tap any blessing star later to see who lit it.
        </p>

        <MagneticButton
          type="button"
          onClick={() => setClaimOpen(true)}
          className="bg-gold text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-gold-soft"
        >
          <Sparkles className="size-4 shrink-0" />
          Design &amp; place my star
        </MagneticButton>
      </GlassCard>

      <ClaimStarDialog
        open={claimOpen}
        onOpenChange={setClaimOpen}
        onStarClaimed={onStarClaimed}
      />
    </section>
  );
}
