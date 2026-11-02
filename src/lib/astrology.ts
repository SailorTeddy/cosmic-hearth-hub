import {
  AFFIRMATION_SEEDS,
  AFFIRM_OBJECTS,
  AFFIRM_STEMS,
  AFFIRM_TAILS,
  BOX_PROMPTS,
  CLOSINGS,
  DAY_THREAD_SEEDS,
  ELEMENT_LINES,
  SEND_PROMPTS,
  SIGN_OPENERS,
  THREAD_ACTIONS,
  THREAD_MIDDLES,
  THREAD_PEOPLE,
  UNIVERSAL_AFFIRMATIONS,
} from "@/lib/astrology-banks";
import { skyLabel, skyProseLine, skySnapshot, type SkySnapshot } from "@/lib/sky";

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

type Element = ZodiacSign["element"];

type GatewayFocus = {
  name: string;
  line: string;
  /** A 60-second practice — a threshold, not a clinical method. */
  practice: string;
  elements: Element[];
};

/**
 * Gateway tones — public Monroe vocabulary used as poetry, not a method.
 * Each sign draws from foci that fit its element, so the rite feels native.
 */
const GATEWAYS: GatewayFocus[] = [
  {
    name: "Focus 10",
    line: "Mind awake, body quiet. Let the day arrive without dragging your nerves behind it.",
    practice: "Sit still. Let your body grow heavy while your attention stays bright, like a lamp in a sleeping house.",
    elements: ["Earth", "Water"],
  },
  {
    name: "Focus 12",
    line: "Awareness wider than the room. Someone you have not spoken to still fits inside this field.",
    practice: "Picture your awareness expanding past the walls, past the street, until it can hold everyone you have ever loved.",
    elements: ["Air", "Water"],
  },
  {
    name: "Focus 15",
    line: "Time loosens its grip. The love you meant to send is not late. It is waiting at the edge of now.",
    practice: "Imagine the clock going quiet. Past and future sit at the same table. Send one old kindness forward.",
    elements: ["Water", "Air"],
  },
  {
    name: "Focus 21",
    line: "The far shore of memory. Visit, bless what you find, and come back carrying only the warmth.",
    practice: "Walk to the edge of an old memory. Bless it without reliving it. Return with only the warmth.",
    elements: ["Water"],
  },
  {
    name: "Focus 27",
    line: "Near the edge of the known. Bring one living name with you, then return.",
    practice: "Picture a horizon of soft light. Place one person's name there. Wish them well. Step back into the room.",
    elements: ["Air", "Water", "Fire"],
  },
  {
    name: "Resonant tuning",
    line: "Both sides of you agree for a moment. Thought and feeling stop arguing and become one note.",
    practice: "Hum three long, low breaths. Feel the sound in your chest. Let the vibration settle the noise.",
    elements: ["Air", "Fire"],
  },
  {
    name: "Energy conversion box",
    line: "Not every weight needs carrying today. Some things can wait in a box you trust.",
    practice: "Picture a sturdy box. Place one worry inside, close the lid, and set it down. It will keep.",
    elements: ["Earth", "Fire"],
  },
  {
    name: "Energy bar",
    line: "Charge only what you mean to keep. Attention is the current. Spend it like it is sacred.",
    practice: "Imagine a bar of light in your hands. Point it at one thing you want to grow today. Nothing else.",
    elements: ["Fire"],
  },
  {
    name: "The click",
    line: "A small interior yes. You do not force the shift. You notice you already moved.",
    practice: "Breathe out slowly and wait for the tiny click of ease. Don't chase it. Just notice when it lands.",
    elements: ["Air", "Earth"],
  },
  {
    name: "Living pattern",
    line: "What you repeat becomes the shape of the day. One kind pattern is enough to retune it.",
    practice: "Choose one small gesture — a word, a glance, a glass of water — and repeat it with intention all day.",
    elements: ["Earth"],
  },
  {
    name: "Hemi-sync",
    line: "Left and right, logic and myth, meet in the middle. Speak from that meeting.",
    practice: "Close your eyes. Picture the two halves of your mind as two stars drawing into one steady orbit.",
    elements: ["Air", "Fire"],
  },
  {
    name: "Resonant energy balloon",
    line: "A field of calm moves with you. It is gentle, porous, and yours.",
    practice: "Imagine a soft sphere of light around you. Let it cool anger, warm fear, and keep your center clear.",
    elements: ["Fire", "Water"],
  },
  {
    name: "Free flow",
    line: "Stop steering for a minute. The current knows a quieter route home.",
    practice: "Let thoughts drift like clouds for sixty seconds. Do not follow any of them. Watch the sky between.",
    elements: ["Water", "Air"],
  },
  {
    name: "Patterning",
    line: "What you picture with feeling becomes easier to walk toward.",
    practice: "See one good moment from tomorrow in detail: the light, the voice, the relief. Feel it as already true.",
    elements: ["Fire", "Earth"],
  },
  {
    name: "Remote viewing heart",
    line: "Attention can travel. Send warmth the way light travels — without needing a reply.",
    practice: "Close your eyes. Picture someone far away in soft gold light. Hold them there for three breaths.",
    elements: ["Air", "Water", "Fire"],
  },
  {
    name: "The gateway",
    line: "A doorway, not an escape. Step through, remember someone, and return more yourself.",
    practice: "Picture a doorway of soft gold. Step through, think of someone who crossed your path, and step back.",
    elements: ["Fire", "Earth", "Air", "Water"],
  },
];

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

function signOffset(signName: string): number {
  let h = 0;
  for (let i = 0; i < signName.length; i++) h = (h * 33 + signName.charCodeAt(i)) >>> 0;
  return h;
}

/** UTC calendar day number — stable across timezones for the same civil date. */
function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/**
 * Walk each pool once per day. Full reading repeats only at LCM of pool lengths.
 * `stream` primes stagger components per sign.
 */
function pick<T>(list: T[], day: number, salt: number, stream: number): T {
  const idx = (((day + Math.imul(salt, stream)) % list.length) + list.length) % list.length;
  return list[idx];
}

/** Compose remembrance threads so the middle line stays fresh for years. */
function dayThread(day: number, salt: number): string {
  // ~2/5 of days use a handcrafted seed; the rest compose action + person + coda.
  if ((day + salt) % 5 < 2) {
    return pick(DAY_THREAD_SEEDS, day, salt, 13);
  }
  const action = pick(THREAD_ACTIONS, day, salt, 41);
  const person = pick(THREAD_PEOPLE, day, salt, 43);
  const middle = pick(THREAD_MIDDLES, day, salt, 47);
  return `${action} ${person}. ${middle}`;
}

/**
 * Affirmations: mostly handcrafted seeds + universal lines; some days compose
 * from stem/object/tail so the spoken line can stay unique for years.
 *
 * Approx unique spoken lines per sign:
 * seeds(~20) + universal(~67) + stems(8)×objects(20)×tails(20) ≈ 3,200+
 */
function dailyAffirmation(signName: string, day: number, salt: number): string {
  const seeds = AFFIRMATION_SEEDS[signName] ?? AFFIRMATION_SEEDS.Leo;
  const stems = AFFIRM_STEMS[signName] ?? AFFIRM_STEMS.Leo;
  const objects = AFFIRM_OBJECTS[signName] ?? AFFIRM_OBJECTS.Leo;
  // 0–2: curated seed, 3: universal, 4–6: composed (majority composed for longevity)
  const mode = (day + salt) % 7;
  if (mode <= 2) return pick(seeds, day, salt, 23);
  if (mode === 3) return pick(UNIVERSAL_AFFIRMATIONS, day, salt, 29);
  const stem = pick(stems, day, salt, 31);
  const object = pick(objects, day, salt, 37);
  const tail = pick(AFFIRM_TAILS, day, salt, 41);
  return `${stem} ${object}, ${tail}`;
}

export type DailyReading = {
  prose: string;
  gateway: { name: string; line: string; practice: string };
  affirmation: string;
  /** The 60-second rite, in order: tune, box, cross, speak, send. */
  rite: Array<{ step: string; text: string }>;
  /** Real tropical sky used for this reading */
  sky: SkySnapshot;
  skyLabel: string;
};

/**
 * Deterministic daily rite anchored to the real sky (sun sign, moon sign, phase)
 * plus natal sun-sign voice. Changes every calendar day.
 */
export function dailyReading(signName: string, date = new Date()): DailyReading {
  const sign = ZODIAC.find((s) => s.name === signName);
  const elementName = sign?.element ?? "Fire";
  const openers = SIGN_OPENERS[signName] ?? SIGN_OPENERS.Leo;
  const elementLines = ELEMENT_LINES[elementName];
  const foci = GATEWAYS.filter((g) => g.elements.includes(elementName));
  const day = dayNumber(date);
  const salt = signOffset(signName);
  const sky = skySnapshot(date);
  // Mix real sky into the salt so picks shift with moon sign/phase, not only civil day.
  const skySalt =
    salt +
    Math.floor(sky.moonLongitude) * 17 +
    Math.floor(sky.sunLongitude) * 3 +
    Math.round(sky.illumination * 100);
  const opener = pick(openers, day, skySalt, 7);
  const element = pick(elementLines, day, skySalt, 11);
  const thread = dayThread(day, skySalt);
  const closing = pick(CLOSINGS, day, skySalt, 17);
  const gateway = pick(foci, day, skySalt, 19);
  const affirmation = dailyAffirmation(signName, day, skySalt);
  const box = pick(BOX_PROMPTS, day, skySalt, 53);
  const send = pick(SEND_PROMPTS, day, skySalt, 59);
  const skyLine = skyProseLine(signName, sky, day, skySalt);

  return {
    prose: `${opener} ${element} ${skyLine} ${thread} ${closing}`,
    gateway: { name: gateway.name, line: gateway.line, practice: gateway.practice },
    affirmation,
    sky,
    skyLabel: skyLabel(sky),
    rite: [
      { step: "Tune", text: "Three slow breaths out, humming low. Let the chest buzz." },
      { step: "Box", text: `Set down ${box}. It will keep until you choose to open it.` },
      { step: "Cross", text: gateway.practice },
      { step: "Speak", text: `Out loud, once: “${affirmation}”` },
      { step: "Send", text: `Think of ${send}. Wish them well. No reply needed.` },
    ],
  };
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

/** Local calendar key YYYY-M-D for refreshing UI at midnight. */
export function calendarDayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
