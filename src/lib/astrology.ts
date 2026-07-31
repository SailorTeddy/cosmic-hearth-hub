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

/** Sign-specific openers — the voice of that sun. */
const SIGN_OPENERS: Record<string, string[]> = {
  Capricorn: [
    "Steady hands build quiet miracles today.",
    "The mountain doesn't hurry — and neither should you.",
    "Someone notices your reliability.",
    "A small plan becomes the scaffold for something lasting.",
    "Discipline feels like devotion, not duty, for a few bright hours.",
    "Your patience is compounding interest the cosmos can see.",
    "Choose the solid step over the flashy leap.",
    "Ambition softens into care — build something that holds people.",
    "The long game loves you back when you show up on time.",
    "Quiet competence is your loudest charm today.",
  ],
  Aquarius: [
    "A curious spark wants out of your head and into the room.",
    "Friendship is your constellation tonight.",
    "Break one tiny rule that only you invented.",
    "The future taps your shoulder with an odd, good idea.",
    "Your difference is the gift — don't sand it down.",
    "A sideways text opens a brighter orbit.",
    "Invent a kinder system for one small corner of the day.",
    "The crowd can wait; your weird truth can't.",
    "Lightning-bolt insight arrives mid-sentence — catch it.",
    "Community wants your particular frequency. Tune in.",
  ],
  Pisces: [
    "Dreams are leaving breadcrumbs.",
    "Your softness is not a weakness today — it's the weather everyone needs.",
    "Music, water, or a quiet walk will translate what words can't quite hold.",
    "Follow the gentlest instinct before the noise starts.",
    "Imagination is practical magic if you give it twenty minutes.",
    "A tide of feeling wants naming; kindness is the shore.",
    "Art finds you when you stop forcing the plot.",
    "Compassion is your compass — trust where it points.",
    "The veil is thin; listen for the whisper under the chatter.",
    "Rest is a portal. Step through without apology.",
  ],
  Aries: [
    "Ignition without apology.",
    "A bold yes opens a door that overthinking kept locked.",
    "Friendly competition sharpens you.",
    "Start the thing you've been circling — momentum loves courage.",
    "Trust the first heat; refine it after you move.",
    "Your spark lights the room when you stop waiting for perfect.",
    "Play hard, then laugh harder.",
    "A clean beginning beats a polished hesitation.",
    "Courage today is small and immediate — take it.",
    "Lead with action; the map draws itself behind you.",
  ],
  Taurus: [
    "Pleasure is practical today: good food, a slow hour, something soft under your hands.",
    "Protect your peace like a garden.",
    "Patience pays interest.",
    "What you're tending is closer to bloom than it looks.",
    "Not every invitation deserves a seat at your table.",
    "Beauty in the body resets the mind — stretch, taste, breathe.",
    "Stability is a love language. Offer it to yourself first.",
    "A loyal yes is worth more than a dozen maybe's.",
    "Sensory joy is not a distraction; it's fuel.",
    "Hold your ground gently. Roots beat rush.",
  ],
  Gemini: [
    "Two truths can sit at the same table.",
    "Your words travel farther than usual — make them kind and specific.",
    "A quick pivot isn't flaky; it's fluent.",
    "Ask one more question before you decide.",
    "Follow the brighter thread in the conversation.",
    "Wit opens doors sincerity keeps open.",
    "A short note lands louder than a long speech.",
    "Curiosity is your passport — stamp something new.",
    "Trade gossip for genuine intrigue.",
    "Your mind wants a playmate. Find one.",
  ],
  Cancer: [
    "Home is a feeling you can pack.",
    "Check on your people — and let someone check on you.",
    "Nostalgia is a compass, not a cage.",
    "Bring a little hearth with you into the day.",
    "The tide runs both ways; receive as well as give.",
    "Keep the lesson; release the weight.",
    "Soft boundaries are still boundaries — draw one kindly.",
    "Family (chosen or blood) needs your particular warmth.",
    "A meal shared is a spell that works.",
    "Tend the inner child; the adult will thank you.",
  ],
  Leo: [
    "Your light doesn't need permission.",
    "Celebrate a small win out loud.",
    "Lead with heart, not volume.",
    "Offer your warmth generously and watch the room brighten.",
    "Joy multiplies when it's witnessed — invite a witness.",
    "The crown fits better when it's made of kindness.",
    "Creative fire wants a stage, even a tiny one.",
    "Pride in your people is holy today. Say it.",
    "Shine without dimming anyone else.",
    "A playful roar beats a heavy silence.",
  ],
  Virgo: [
    "Order one corner of the chaos and the rest softens.",
    "Your careful eye catches what others miss.",
    "Rest is also maintenance.",
    "Tiny repairs, real relief.",
    "Share the fix without the lecture.",
    "Schedule kindness to yourself like any other task.",
    "Precision is love when it serves people, not perfection.",
    "Clear the clutter; clarity follows.",
    "A useful ritual beats a grand resolution.",
    "Help where it's quiet — that's where you're needed.",
  ],
  Libra: [
    "Balance isn't stillness; it's a graceful adjustment.",
    "Beauty in the small things resets the whole day.",
    "A fair ask clears the air.",
    "Harmony loves honesty more than silence.",
    "Shift until it feels true — then stay.",
    "A table, a playlist, a kind reply: design the mood.",
    "Partnership thrives when both voices have room.",
    "Diplomacy with backbone is your superpower today.",
    "Choose the elegant solution that still tells the truth.",
    "Symmetry can wait; sincerity can't.",
  ],
  Scorpio: [
    "Go one layer deeper than polite.",
    "Your intuition is loud for a reason.",
    "Release what you've already outgrown.",
    "The real conversation is waiting underneath.",
    "Don't dilute the knowing to keep the peace.",
    "Empty space is an invitation, not a loss.",
    "Loyalty is sacred — spend it where it's returned.",
    "Transform one sticky feeling into clear action.",
    "Privacy is power; share only what feels earned.",
    "Truth with tenderness changes everything.",
  ],
  Sagittarius: [
    "The horizon is calling in a familiar voice.",
    "Humor is your passport today.",
    "Teach what you just learned.",
    "Say yes to a little more sky.",
    "Use laughter to cross a sticky moment.",
    "The lesson sticks when it leaves your mouth.",
    "Adventure can be a new street, not a new country.",
    "Optimism with evidence — look for both.",
    "Stretch your map; leave room for wonder.",
    "Freedom loves a plan loose enough to breathe.",
  ],
};

/** Shared middle threads — rotate daily so each calendar day feels new. */
const DAY_THREADS = [
  "A small kindness changes the weather in the room.",
  "Text the person who crossed your mind twice.",
  "Leave ten minutes unscheduled and let luck find you.",
  "Name one fear out loud — it shrinks in daylight.",
  "Trade urgency for presence just once this afternoon.",
  "Wear the color that makes you feel like yourself.",
  "Cook something simple as if it were a celebration.",
  "Say the compliment you've been rehearsing in your head.",
  "Walk without headphones and notice three beautiful accidents.",
  "Choose the kinder interpretation of someone's silence.",
  "Finish one undone thing that has been humming in the background.",
  "Ask for help before you burn the candle at both ends.",
  "Write three lines you'll be glad you kept.",
  "Put your phone face-down during the best part of the day.",
  "Forgive a tiny version of yourself from last year.",
  "Make the next yes specific and the next no guilt-free.",
  "Look up — literally — and borrow a little sky.",
  "Offer water, tea, or time. Hospitality is a spell.",
  "Let a plan be 80% ready and begin anyway.",
  "Keep a promise to your body: stretch, hydrate, or sleep.",
  "Retell a family story with more laughter than before.",
  "Spend five minutes on something useless and delightful.",
  "Swap judgment for curiosity in one sticky moment.",
  "Light a candle, open a window, reset the room's mood.",
  "Send proof of love — a photo, a voice note, a meme that fits.",
  "Protect one quiet hour like it's a VIP guest.",
  "Learn one new fact about the cosmos or someone you love.",
  "Do the brave boring thing: confirm, pay, schedule, send.",
  "Leave a place better than you found it — including a conversation.",
  "Choose warmth over winning when the stakes are small.",
  "End the day with one honest sentence about how you feel.",
];

const CLOSINGS = [
  "Keep the soft parts visible.",
  "The orbit answers when you show up.",
  "Fresh air follows.",
  "Let that warmth land; you earned it.",
  "Momentum loves courage.",
  "Joy multiplies in company.",
  "Trust the quieter signal.",
  "You're more ready than you feel.",
  "Tonight, rest like you mean it.",
  "Carry the good thought into tomorrow.",
  "The hearth is portable — take it with you.",
  "Stars don't rush; neither must you.",
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

function pick<T>(list: T[], day: number, salt: number, stride: number): T {
  // stride coprime-ish to typical list lengths so consecutive days never repeat
  const idx = ((day * stride + salt) % list.length + list.length) % list.length;
  return list[idx];
}

/**
 * Deterministic daily reading that changes every calendar day.
 * Composes sign voice + day thread + closing so the text is new far more often
 * than a tiny fixed list would allow.
 */
export function dailyReading(signName: string, date = new Date()): string {
  const openers = SIGN_OPENERS[signName] ?? SIGN_OPENERS.Leo;
  const day = dayNumber(date);
  const salt = signOffset(signName);
  const opener = pick(openers, day, salt, 7);
  const thread = pick(DAY_THREADS, day, salt * 3, 13);
  const closing = pick(CLOSINGS, day, salt * 11, 5);
  return `${opener} ${thread} ${closing}`;
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
