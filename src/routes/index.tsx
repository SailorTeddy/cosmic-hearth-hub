import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CosmicBackground } from "@/components/CosmicBackground";
import { Hero } from "@/components/Hero";
import { Journal } from "@/components/Journal";
import { Astrology } from "@/components/Astrology";
import { Support } from "@/components/Support";
import { Guestbook } from "@/components/Guestbook";
import { Footer } from "@/components/Footer";
import { fetchBlessingStars } from "@/lib/blessing-stars-api";
import type { BlessingStar } from "@/lib/blessing-stars";

const TITLE = "The Nichols Estate — Family Hub";
const DESCRIPTION =
  "Family updates, milestones and space to connect. The Nichols Estate is our little corner of the universe — journal entries, photos, a guestbook and a way to send a blessing.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "The Nichols Estate",
          description: DESCRIPTION,
        }),
      },
    ],
  }),
});

function Index() {
  const [blessings, setBlessings] = useState<BlessingStar[]>([]);

  useEffect(() => {
    let alive = true;
    fetchBlessingStars()
      .then((stars) => {
        if (alive) setBlessings(stars);
      })
      .catch(() => {
        /* sky stays empty if offline */
      });
    return () => {
      alive = false;
    };
  }, []);

  const onStarClaimed = useCallback((star: BlessingStar) => {
    setBlessings((prev) => (prev.some((s) => s.id === star.id) ? prev : [...prev, star]));
  }, []);

  return (
    <>
      <CosmicBackground blessings={blessings} />
      <main className="relative z-10">
        <Hero />
        <Support onStarClaimed={onStarClaimed} />
        <Journal />
        <Astrology />
        <Guestbook />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </>
  );
}
