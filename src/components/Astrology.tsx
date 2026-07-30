import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { FAMILY_BIRTHDAYS } from "@/data/family";
import {
  dailyReading,
  daysUntilBirthday,
  formatBirthday,
  getZodiacSign,
} from "@/lib/astrology";
import { GlassCard } from "@/components/glass";
import { cn } from "@/lib/utils";

export function Astrology() {
  const today = useMemo(() => new Date(), []);

  const members = useMemo(() => {
    return FAMILY_BIRTHDAYS.map((person) => {
      const sign = getZodiacSign(person.month, person.day);
      const days = daysUntilBirthday(person.month, person.day, today);
      return {
        ...person,
        sign,
        days,
        reading: dailyReading(sign.name, today),
        birthdayLabel: formatBirthday(person.month, person.day),
      };
    }).sort((a, b) => a.days - b.days);
  }, [today]);

  const featuredIndex = useMemo(() => {
    if (members.length === 0) return 0;
    const seed = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
    return seed % members.length;
  }, [members.length, today]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    members.find((m) => m.id === (selectedId ?? members[featuredIndex]?.id)) ?? members[0];

  if (members.length === 0) {
    return null;
  }

  const countdown =
    selected.days === 0
      ? "Birthday today"
      : selected.days === 1
        ? "Birthday tomorrow"
        : `${selected.days} days until birthday`;

  return (
    <section id="stars" className="mx-auto max-w-5xl scroll-mt-16 px-4 py-20 sm:px-6">
      <header className="mb-8 text-center">
        <h2 className="gold-text text-3xl font-bold sm:text-4xl">Family Stars</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Birthdays, sun signs, and a fresh cosmic note each day. Readings refresh at midnight.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {members.map((person) => {
          const active = person.id === selected.id;
          return (
            <button
              key={person.id}
              type="button"
              onClick={() => setSelectedId(person.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm",
                active
                  ? "border-gold/60 bg-gold text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "border-glass-border bg-secondary text-muted-foreground hover:text-champagne",
              )}
            >
              <span className="mr-1.5 opacity-80">{person.sign.symbol}</span>
              {person.name}
              {person.days === 0 && (
                <span className="ml-1.5 text-[0.65rem] tracking-wide uppercase opacity-90">
                  today
                </span>
              )}
            </button>
          );
        })}
      </div>

      <GlassCard
        key={selected.id}
        tilt={false}
        className="animate-rise-in relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 size-64 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--gold)_18%,transparent),transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 left-0 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--nebula)_28%,transparent),transparent_70%)]"
        />

        <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span
              className="animate-float-soft gold-text text-6xl leading-none sm:text-7xl"
              aria-hidden
            >
              {selected.sign.symbol}
            </span>
            <p className="mt-4 text-xs font-semibold tracking-[0.2em] text-gold uppercase">
              {selected.sign.name} · {selected.sign.element}
            </p>
            <h3 className="mt-2 text-2xl font-bold text-champagne sm:text-3xl">{selected.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {selected.birthdayLabel}
              <span className="mx-2 text-glass-border">·</span>
              {countdown}
            </p>
          </div>

          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-gold uppercase">
              <Sparkles className="size-3.5" />
              Today&apos;s reading
            </div>
            <p className="text-base leading-relaxed text-champagne/95 sm:text-lg">
              {selected.reading}
            </p>
            <p className="mt-5 text-xs text-muted-foreground">
              {selected.name}&apos;s {selected.sign.name} season · {selected.sign.dates}
            </p>
          </div>
        </div>
      </GlassCard>

      {members.some((m) => m.days <= 14) && (
        <p className="animate-rise-in mt-6 text-center text-sm text-muted-foreground">
          Coming up:{" "}
          {members
            .filter((m) => m.days <= 14)
            .map((m) =>
              m.days === 0 ? `${m.name} (today!)` : `${m.name} in ${m.days}d`,
            )
            .join(" · ")}
        </p>
      )}
    </section>
  );
}
