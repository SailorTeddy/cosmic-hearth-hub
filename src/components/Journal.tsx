import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { JOURNAL_ENTRIES, type JournalCategory, type JournalEntry } from "@/data/journal";
import { GlassCard } from "@/components/glass";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchJournalEntries } from "@/lib/journal-api";

const FILTERS: Array<"All" | JournalCategory> = ["All", "Milestones", "Projects", "Life"];

export function Journal() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: fetchJournalEntries,
    enabled: isSupabaseConfigured,
    staleTime: 30_000,
  });

  const source: JournalEntry[] = !isSupabaseConfigured ? JOURNAL_ENTRIES : (data ?? []);

  const entries = useMemo(
    () => (filter === "All" ? source : source.filter((e) => e.category === filter)),
    [filter, source],
  );

  return (
    <section id="journal" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20 sm:px-6">
      <header className="mb-8 text-center">
        <h2 className="gold-text text-3xl font-bold sm:text-4xl">The Family Journal</h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Updates, milestones and photo drops — newest orbit first.
        </p>
      </header>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm",
              filter === f
                ? "border-gold/60 bg-gold text-primary-foreground shadow-[var(--shadow-glow)]"
                : "border-glass-border bg-secondary text-muted-foreground hover:text-champagne",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isSupabaseConfigured && isLoading && (
        <p className="text-center text-sm text-muted-foreground">Loading journal…</p>
      )}

      {isSupabaseConfigured && isError && (
        <p className="text-center text-sm text-muted-foreground">
          Couldn&apos;t load journal posts right now. Please try again later.
        </p>
      )}

      {!isLoading && entries.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No journal posts yet — check back soon.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry, i) => (
          <GlassCard
            key={entry.id}
            className="animate-rise-in flex flex-col overflow-hidden"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {entry.image && (
              <button
                type="button"
                onClick={() => setLightbox({ src: entry.image!, alt: entry.imageAlt ?? entry.title })}
                className="group relative block aspect-[4/3] w-full overflow-hidden"
              >
                <img
                  src={entry.image}
                  alt={entry.imageAlt ?? entry.title}
                  loading="lazy"
                  width={1200}
                  height={900}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-[linear-gradient(to_top,var(--background),transparent_55%)] opacity-80" />
              </button>
            )}
            <div className="flex min-w-0 flex-1 flex-col p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="truncate text-xs font-semibold tracking-widest text-gold uppercase">
                  {entry.category}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{entry.date}</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-champagne">{entry.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.body}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-md"
        >
          <button
            aria-label="Close image"
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 rounded-full border border-glass-border bg-secondary p-2 text-champagne"
          >
            <X className="size-5" />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="animate-rise-in max-h-[85vh] w-auto max-w-full rounded-lg border border-glass-border shadow-[var(--shadow-glow-strong)]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
