import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { CosmicBackground } from "@/components/CosmicBackground";
import { fetchBlessingStars } from "@/lib/blessing-stars-api";
import {
  FAMILY_SIDE_LABELS,
  FAMILY_SIDES,
  type BlessingStar,
  type FamilySide,
} from "@/lib/blessing-stars";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sky")({
  component: SkyPage,
  head: () => ({
    meta: [
      { title: "Family Sky — The Nichols Estate" },
      {
        name: "description",
        content:
          "Explore the Nichols Estate universe — tap blessing star clusters from the Rentz side, Nichols side, and chosen family.",
      },
    ],
  }),
});

type SideFilter = FamilySide | "all";

function SkyPage() {
  const [blessings, setBlessings] = useState<BlessingStar[]>([]);
  const [filterSide, setFilterSide] = useState<SideFilter>("all");
  const [focusClusterId, setFocusClusterId] = useState<string | null>(null);
  const [rosterOpen, setRosterOpen] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchBlessingStars()
      .then((stars) => {
        if (alive) setBlessings(stars);
      })
      .catch(() => {
        /* empty sky if offline */
      });
    return () => {
      alive = false;
    };
  }, []);

  const clearFocus = useCallback(() => setFocusClusterId(null), []);

  const filtered = useMemo(
    () =>
      filterSide === "all"
        ? blessings
        : blessings.filter((b) => b.family_side === filterSide),
    [blessings, filterSide],
  );

  const counts = useMemo(() => {
    const base = { all: blessings.length, nichols: 0, rentz: 0, chosen: 0 };
    for (const b of blessings) base[b.family_side] += 1;
    return base;
  }, [blessings]);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-black text-foreground">
      <CosmicBackground
        blessings={blessings}
        mode="explore"
        filterSide={filterSide}
        focusClusterId={focusClusterId}
        onFocusClusterHandled={clearFocus}
      />

      <header
        data-sky-ui
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-3 p-4 sm:p-5"
      >
        <Link
          to="/"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-glass-border bg-black/55 px-3 py-2 text-xs font-semibold text-champagne backdrop-blur-md transition-colors hover:border-gold/50 hover:text-gold"
        >
          <ArrowLeft className="size-3.5" />
          Back to the Estate
        </Link>

        <div className="pointer-events-auto max-w-[14rem] text-right sm:max-w-none">
          <p className="gold-text text-lg font-bold tracking-wide sm:text-xl">Family Sky</p>
          <p className="mt-0.5 text-[0.7rem] text-muted-foreground sm:text-xs">
            Pick a family to travel · scroll or +/− to zoom · double-tap a star
          </p>
        </div>
      </header>

      <div data-sky-ui className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4 sm:p-5">
        <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-3">
          <div className="flex flex-wrap justify-center gap-2">
            <FilterChip
              active={filterSide === "all"}
              onClick={() => setFilterSide("all")}
              label={`All (${counts.all})`}
            />
            {FAMILY_SIDES.map((side) => (
              <FilterChip
                key={side}
                active={filterSide === side}
                onClick={() => setFilterSide(side)}
                label={`${FAMILY_SIDE_LABELS[side]} (${counts[side]})`}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-glass-border bg-black/60 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setRosterOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-gold uppercase">
                <Sparkles className="size-3.5" />
                Family roster
              </span>
              <span className="text-xs text-muted-foreground">
                {rosterOpen ? "Hide" : "Show"} · {filtered.length}{" "}
                {filtered.length === 1 ? "cluster" : "clusters"}
              </span>
            </button>

            {rosterOpen && (
              <div className="max-h-[32vh] overflow-y-auto border-t border-glass-border px-2 py-2 sm:max-h-[40vh]">
                {filtered.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No blessing stars here yet. Send a blessing on the home page to light one.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {filtered.map((cluster) => (
                      <li key={cluster.id}>
                        <button
                          type="button"
                          onClick={() => setFocusClusterId(cluster.id)}
                          className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                        >
                          <span
                            className="mt-1 size-2.5 shrink-0 rounded-full border border-white/30"
                            style={{ backgroundColor: cluster.color }}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-champagne">
                              {cluster.name}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {FAMILY_SIDE_LABELS[cluster.family_side]} ·{" "}
                              {cluster.members?.length || cluster.star_count}{" "}
                              {(cluster.members?.length || cluster.star_count) === 1
                                ? "star"
                                : "stars"}
                            </span>
                            {cluster.members?.length ? (
                              <span className="mt-1 block truncate text-[0.7rem] text-muted-foreground/80">
                                {cluster.members.map((m) => m.name).join(" · ")}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <p className="text-center text-[0.7rem] text-muted-foreground">
            <a href="/#support" className="text-gold/90 underline-offset-2 hover:underline">
              Place a star
            </a>{" "}
            after sending a blessing
          </p>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-gold/70 bg-gold/20 text-champagne"
          : "border-glass-border bg-black/50 text-muted-foreground backdrop-blur-md hover:text-champagne",
      )}
    >
      {label}
    </button>
  );
}
