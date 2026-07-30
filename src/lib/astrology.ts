export type ZodiacSign = {
  name: string;
  symbol: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  dates: string;
  /** month*100+day inclusive ranges; handles Capricorn wrap */
  start: number;
  end: number;
  wrapsYear?: boolean;
};

export const ZODIAC: ZodiacSign[] = [
  { name: "Capricorn", symbol: "♑", element: "Earth", dates: "Dec 22 – Jan 19", start: 1222, end: 119, wrapsYear: true },
  { name: "Aquarius", symbol: "♒", element: "Air", dates: "Jan 20 – Feb 18", start: 120, end: 218 },
  { name: "Pisces", symbol: "♓", element: "Water", dates: "Feb 19 – Mar 20", start: 219, end: 320 },
  { name: "Aries", symbol: "♈", element: "Fire", dates: "Mar 21 – Apr 19", start: 321, end: 419 },
  { name: "Taurus", symbol: "♉", element: "Earth", dates: "Apr 20 – May 20", start: 420, end: 520 },
  { name: "Gemini", symbol: "♊", element: "Air", dates: "May 21 – Jun 20", start: 521, end: 620 },
  { name: "Cancer", symbol: "♋", element: "Water", dates: "Jun 21 – Jul 22", start: 621, end: 722 },
  { name: "Leo", symbol: "♌", element: "Fire", dates: "Jul 23 – Aug 22", start: 723, end: 822 },
  { name: "Virgo", symbol: "♍", element: "Earth", dates: "Aug 23 – Sep 22", start: 823, end: 922 },
  { name: "Libra", symbol: "♎", element: "Air", dates: "Sep 23 – Oct 22", start: 923, end: 1022 },
  { name: "Scorpio", symbol: "♏", element: "Water", dates: "Oct 23 – Nov 21", start: 1023, end: 1121 },
  { name: "Sagittarius", symbol: "♐", element: "Fire", dates: "Nov 22 – Dec 21", start: 1122, end: 1221 },
];

const READINGS: Record<string, string[]> = {
  Capricorn: [
    "Steady hands build quiet miracles today. A small plan becomes the scaffold for something lasting.",
    "The mountain doesn't hurry — and neither should you. One solid step outshines ten scattered ones.",
    "Someone notices your reliability. Let that warmth land; you earned the soft applause.",
  ],
  Aquarius: [
    "A curious spark wants out of your head and into the room. Share the odd idea — it's the good one.",
    "Friendship is your constellation tonight. Text out sideways; the orbit answers.",
    "Break one tiny rule that only you invented. Fresh air follows.",
  ],
  Pisces: [
    "Dreams are leaving breadcrumbs. Follow the gentlest one before the noise starts.",
    "Your softness is not a weakness today — it's the weather everyone needs.",
    "Music, water, or a quiet walk will translate what words can't quite hold.",
  ],
  Aries: [
    "Ignition without apology. Start the thing you've been circling — momentum loves courage.",
    "A bold yes opens a door that overthinking kept locked. Trust the first heat.",
    "Friendly competition sharpens you. Play hard, then laugh harder.",
  ],
  Taurus: [
    "Pleasure is practical today: good food, a slow hour, something soft under your hands.",
    "Protect your peace like a garden. Not every invitation deserves a seat at your table.",
    "Patience pays interest. What you're tending is closer to bloom than it looks.",
  ],
  Gemini: [
    "Two truths can sit at the same table. Ask one more question before you decide.",
    "Your words travel farther than usual — make them kind and specific.",
    "A quick pivot isn't flaky; it's fluent. Follow the brighter thread.",
  ],
  Cancer: [
    "Home is a feeling you can pack. Bring a little hearth with you into the day.",
    "Check on your people — and let someone check on you. The tide runs both ways.",
    "Nostalgia is a compass, not a cage. Keep the lesson; release the weight.",
  ],
  Leo: [
    "Your light doesn't need permission. Offer it generously and watch the room warm.",
    "Celebrate a small win out loud. Joy multiplies when it's witnessed.",
    "Lead with heart, not volume. The crown fits better that way today.",
  ],
  Virgo: [
    "Order one corner of the chaos and the rest softens. Tiny repairs, real relief.",
    "Your careful eye catches what others miss — share the fix without the lecture.",
    "Rest is also maintenance. Schedule kindness to yourself like any other task.",
  ],
  Libra: [
    "Balance isn't stillness; it's a graceful adjustment. Shift until it feels true.",
    "Beauty in the small things resets the whole day — a table, a playlist, a kind reply.",
    "A fair ask clears the air. Harmony loves honesty more than silence.",
  ],
  Scorpio: [
    "Go one layer deeper than polite. The real conversation is waiting underneath.",
    "Your intuition is loud for a reason. Don't dilute it to keep the peace.",
    "Release what you've already outgrown. Empty space is an invitation, not a loss.",
  ],
  Sagittarius: [
    "The horizon is calling in a familiar voice. Say yes to a little more sky.",
    "Humor is your passport today — use it to cross a sticky moment.",
    "Teach what you just learned. The lesson sticks when it leaves your mouth.",
  ],
};

function md(month: number, day: number) {
  return month * 100 + day;
}

export function getZodiacSign(month: number, day: number): ZodiacSign {
  const key = md(month, day);
  for (const sign of ZODIAC) {
    if (sign.wrapsYear) {
      if (key >= sign.start || key <= sign.end) return sign;
    } else if (key >= sign.start && key <= sign.end) {
      return sign;
    }
  }
  return ZODIAC[0];
}

/** Deterministic daily pick so readings change with the calendar. */
export function dailyReading(signName: string, date = new Date()): string {
  const list = READINGS[signName] ?? READINGS.Leo;
  const seed = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${signName}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return list[hash % list.length];
}

export function formatBirthday(month: number, day: number): string {
  return new Date(2000, month - 1, day).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

/** Days until next birthday (0 = today). */
export function daysUntilBirthday(month: number, day: number, from = new Date()): number {
  const year = from.getFullYear();
  const today = new Date(year, from.getMonth(), from.getDate());
  let next = new Date(year, month - 1, day);
  if (next < today) next = new Date(year + 1, month - 1, day);
  return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}
