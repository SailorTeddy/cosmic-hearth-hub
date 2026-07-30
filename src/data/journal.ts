import journal1 from "@/assets/journal-1.jpg";
import journal2 from "@/assets/journal-2.jpg";
import journal3 from "@/assets/journal-3.jpg";

export type JournalCategory = "Milestones" | "Projects" | "Life";

export type JournalEntry = {
  id: string;
  category: JournalCategory;
  date: string;
  title: string;
  body: string;
  image?: string;
  imageAlt?: string;
};

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "telescope-night",
    category: "Milestones",
    date: "July 2026",
    title: "First night with the telescope",
    body: "We hauled the whole crew into the backyard, strung up the lights, and spent two hours arguing about which smudge was Saturn. It was Saturn.",
    image: journal1,
    imageAlt: "The family gathered around a telescope in the backyard at night",
  },
  {
    id: "slow-mornings",
    category: "Life",
    date: "June 2026",
    title: "Slow mornings are back",
    body: "Coffee before the noise. Ten quiet minutes at the kitchen table has quietly become the best part of the week.",
    image: journal2,
    imageAlt: "Two hands holding coffee mugs across a wooden kitchen table",
  },
  {
    id: "workshop",
    category: "Projects",
    date: "June 2026",
    title: "The garage workbench build",
    body: "Half-finished, slightly crooked, extremely loved. Phase two involves better clamps and fewer opinions.",
    image: journal3,
    imageAlt: "A half-built wooden workbench under a warm task lamp at night",
  },
  {
    id: "new-chapter",
    category: "Milestones",
    date: "May 2026",
    title: "A new chapter, officially signed",
    body: "Paperwork, pens, and a very long exhale. Thank you to everyone who cheered us through it — you know exactly who you are.",
  },
  {
    id: "sunday-table",
    category: "Life",
    date: "April 2026",
    title: "Sunday table, open invite",
    body: "The rule stands: if you're in town on a Sunday, there's a plate for you. No warning required.",
  },
  {
    id: "site-launch",
    category: "Projects",
    date: "April 2026",
    title: "This little corner of the internet",
    body: "We built a home base so family and friends can keep up without scrolling through five different apps. Welcome in.",
  },
];
