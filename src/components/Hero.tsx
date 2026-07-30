import { useEffect, useState } from "react";
import crest from "@/assets/crest.png";
import { SITE } from "@/config/site";
import { GlassCard, MagneticButton } from "@/components/glass";

function greeting(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function Hero() {
  const [live, setLive] = useState<{ greet: string; time: string; zone: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setLive({
        greet: greeting(now.getHours()),
        time: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        zone:
          Intl.DateTimeFormat().resolvedOptions().timeZone?.split("/").pop()?.replace("_", " ") ??
          "your corner of the world",
      });
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <div className="animate-rise-in glass-panel mb-8 flex items-center gap-3 px-4 py-2 text-xs sm:text-sm">
        <span className="animate-pulse-glow inline-block size-2 shrink-0 rounded-full bg-gold shadow-[var(--shadow-glow)]" />
        <span className="min-w-0 text-muted-foreground">
          {live ? (
            <>
              <span className="font-semibold text-champagne">{live.greet}</span> — {SITE.badge}
              <span className="hidden sm:inline"> · {live.time} in {live.zone}</span>
            </>
          ) : (
            SITE.badge
          )}
        </span>
      </div>

      <GlassCard
        className="animate-rise-in w-full px-6 py-12 sm:px-12 sm:py-16"
        tilt
      >
        <img
          src={crest}
          alt="The Nichols Estate black hole Big Bang crest"
          width={1024}
          height={1024}
          className="animate-float-soft mx-auto mb-8 size-32 [filter:drop-shadow(0_16px_28px_rgba(0,0,0,0.7))_drop-shadow(0_0_36px_rgba(212,175,55,0.4))] sm:size-44"
        />
        <h1 className="gold-text text-4xl font-extrabold sm:text-6xl lg:text-7xl">
          {SITE.name}
        </h1>
        <p className="mt-4 text-base text-champagne/90 sm:text-lg">{SITE.subtitle}</p>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Pull up a chair by the fire. This is where we keep friends, family, and the
          occasional wandering guest up to speed on everything happening in the Nichols
          universe — the big milestones, the small Tuesdays, and everything orbiting in
          between.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href="#journal">
            <MagneticButton className="bg-gold text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-gold-soft">
              Read the Family Journal
            </MagneticButton>
          </a>
          <a href="#guestbook">
            <MagneticButton className="border border-glass-border bg-secondary text-champagne hover:bg-muted">
              Leave us a note
            </MagneticButton>
          </a>
        </div>
      </GlassCard>
    </section>
  );
}
