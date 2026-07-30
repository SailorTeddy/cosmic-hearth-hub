import { createFileRoute } from "@tanstack/react-router";
import { CosmicBackground } from "@/components/CosmicBackground";
import { Hero } from "@/components/Hero";
import { Journal } from "@/components/Journal";
import { Astrology } from "@/components/Astrology";
import { Support } from "@/components/Support";
import { Guestbook } from "@/components/Guestbook";
import { Footer } from "@/components/Footer";

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
  return (
    <>
      <CosmicBackground />
      <main className="relative">
        <Hero />
        <Journal />
        <Astrology />
        <Support />
        <Guestbook />
      </main>
      <Footer />
    </>
  );
}
