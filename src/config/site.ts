/**
 * Edit everything about the Estate here — handles, links, guestbook target.
 */

export const SITE = {
  name: "The Nichols Estate",
  subtitle: "Family Updates, Milestones & Space to Connect.",
  badge: "Welcome to the Nichols Family Hub",
};

export type PayLink = {
  label: string;
  handle: string;
  href?: string;
  /** copy the handle instead of opening a link */
  copyOnly?: boolean;
  note?: string;
};

export const PAYPAL_POOLS = {
  /** original family pool */
  family: "https://www.paypal.com/pool/9pYPCUNolN?sr=wccr",
  /** general fund / Stripe alternative */
  general: "https://www.paypal.com/pool/9rkIwuTLkR?sr=wccr",
};

/** Amazon housewarming / home registry for guests */
export const HOUSEWARMING_REGISTRY = {
  label: "Housewarming Gift List",
  blurb: "Picking out something for the new place? Our Amazon registry has ideas big and small.",
  href: "https://www.amazon.com/registries/gl/guest-view/3MPL0PZAX2CAE",
};

export const PAY_LINKS: PayLink[] = [
  {
    label: "Cash App",
    handle: "$SailorTeddy",
    href: "https://cash.app/$SailorTeddy",
  },
  {
    label: "Cash App",
    handle: "$Srentz97",
    href: "https://cash.app/$Srentz97",
  },
  {
    label: "PayPal Pool",
    handle: "Chip in to the family pool",
    href: PAYPAL_POOLS.family,
  },
  {
    label: "General Funds",
    handle: "PayPal Pool — general support",
    href: PAYPAL_POOLS.general,
  },
  {
    label: "Zelle",
    handle: "Nichols.Emmanuel@outlook.com",
    copyOnly: true,
    note: "Tap to copy",
  },
  {
    label: "Zelle",
    handle: "Monica.Rentz97@gmail.com",
    copyOnly: true,
    note: "Tap to copy",
  },
];

export const QUICK_GIFTS = [
  { amount: 10, title: "Coffee on us", blurb: "A warm cup, from your corner of the galaxy." },
  { amount: 50, title: "Family Dinner Fund", blurb: "Pull up a chair at the table." },
  { amount: 0, title: "Custom Amount", blurb: "Whatever feels right — truly." },
];

export const REACTIONS = [
  { emoji: "🚀", label: "To the moon" },
  { emoji: "💛", label: "Love this" },
  { emoji: "🥂", label: "Cheers" },
  { emoji: "🏡", label: "Home vibes" },
];

/** Where guestbook notes are emailed (server-side via Resend). */
export const GUESTBOOK_NOTIFY_EMAILS = [
  "Nichols.Emmanuel@outlook.com",
  "Monica.Rentz97@gmail.com",
] as const;