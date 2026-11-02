/**
 * Edit everything about the site here — handles, links, registries.
 */

export const SITE = {
  name: "The Nichols Family",
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

/** Primary Cash App for quick-amount gifts */
export const CASH_APP = {
  handle: "$SailorTeddy",
  href: "https://cash.app/$SailorTeddy",
  amountHref: (amount: number) =>
    `https://cash.app/$SailorTeddy/${amount.toFixed(2).replace(/\.00$/, "")}`,
};

/** Baby registries for guests */
export const BABY_REGISTRIES = [
  {
    store: "Amazon",
    label: "Amazon Baby Registry",
    blurb: "Welcoming our little one in January 2027? Ideas big and small on Amazon.",
    href: "https://www.amazon.com/baby-reg/monica-rentz-january-2027-cincinnati/2L483C92ZN5N1?ref_=cm_sw_r_cp_ud_dp_4V92RT81Y6RX9AW95MG5",
  },
  {
    store: "Target",
    label: "Target Baby Registry",
    blurb: "Prefer Target? Monica's baby registry is there too.",
    href: "https://www.target.com/gift-registry/gift-giver?registryId=2256b340-b9e6-11f1-bf3c-0521c0ae78d5&type=BABY&clkid=476aea96Nbe0c11f19d327da410bcf4bb&cpng=PTID1&TCID=AFL-476aea96Nbe0c11f19d327da410bcf4bb-2310483&afsrc=1&lnm=81938&afid=Evite&ref=tgt_adv_xasd0002",
  },
] as const;

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
