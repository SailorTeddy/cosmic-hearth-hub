import { Body, Ecliptic, GeoVector, Illumination, MakeTime } from "astronomy-engine";

export type MoonPhaseName =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

export const SIGN_ORDER = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type SignName = (typeof SIGN_ORDER)[number];

const SIGN_SYMBOL: Record<SignName, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

const SIGN_ELEMENT: Record<SignName, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire",
  Leo: "Fire",
  Sagittarius: "Fire",
  Taurus: "Earth",
  Virgo: "Earth",
  Capricorn: "Earth",
  Gemini: "Air",
  Libra: "Air",
  Aquarius: "Air",
  Cancer: "Water",
  Scorpio: "Water",
  Pisces: "Water",
};

export type SkySnapshot = {
  sunSign: SignName;
  moonSign: SignName;
  sunSymbol: string;
  moonSymbol: string;
  moonPhase: MoonPhaseName;
  /** 0 = new, 1 = full */
  illumination: number;
  sunLongitude: number;
  moonLongitude: number;
};

export type SkyRelation =
  | "same-sign"
  | "same-element"
  | "opposite"
  | "square"
  | "harmonious"
  | "neutral";

function signFromLongitude(lon: number): SignName {
  const normalized = ((lon % 360) + 360) % 360;
  return SIGN_ORDER[Math.floor(normalized / 30) % 12];
}

function phaseName(phaseAngle: number): MoonPhaseName {
  // astronomy-engine: phase_angle 0 = full, 180 = new
  if (phaseAngle < 22.5) return "Full Moon";
  if (phaseAngle < 67.5) return "Waning Gibbous";
  if (phaseAngle < 112.5) return "Last Quarter";
  if (phaseAngle < 157.5) return "Waning Crescent";
  if (phaseAngle < 202.5) return "New Moon";
  if (phaseAngle < 247.5) return "Waxing Crescent";
  if (phaseAngle < 292.5) return "First Quarter";
  if (phaseAngle < 337.5) return "Waxing Gibbous";
  return "Full Moon";
}

/** Real tropical sky for a civil date (noon UTC that day for stability). */
export function skySnapshot(date = new Date()): SkySnapshot {
  const noon = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0),
  );
  const time = MakeTime(noon);
  const sun = Ecliptic(GeoVector(Body.Sun, time, true));
  const moon = Ecliptic(GeoVector(Body.Moon, time, true));
  const illum = Illumination(Body.Moon, time);
  const sunSign = signFromLongitude(sun.elon);
  const moonSign = signFromLongitude(moon.elon);

  return {
    sunSign,
    moonSign,
    sunSymbol: SIGN_SYMBOL[sunSign],
    moonSymbol: SIGN_SYMBOL[moonSign],
    moonPhase: phaseName(illum.phase_angle),
    illumination: illum.phase_fraction,
    sunLongitude: ((sun.elon % 360) + 360) % 360,
    moonLongitude: ((moon.elon % 360) + 360) % 360,
  };
}

/** How today's moon relates to a natal sun sign (by whole-sign aspect). */
export function moonToNatalRelation(natalSun: string, moonSign: string): SkyRelation {
  const a = SIGN_ORDER.indexOf(natalSun as SignName);
  const b = SIGN_ORDER.indexOf(moonSign as SignName);
  if (a < 0 || b < 0) return "neutral";
  const diff = Math.min((a - b + 12) % 12, (b - a + 12) % 12);
  if (diff === 0) return "same-sign";
  if (diff === 6) return "opposite";
  if (diff === 3) return "square";
  if (diff === 4 || diff === 5) return "harmonious";
  if (SIGN_ELEMENT[natalSun as SignName] === SIGN_ELEMENT[moonSign as SignName]) {
    return "same-element";
  }
  return "neutral";
}

const PHASE_LINES: Record<MoonPhaseName, string[]> = {
  "New Moon": [
    "The New Moon favors quiet beginnings — plant one intention without an audience.",
    "Under a New Moon, start soft. The root work counts more than the announcement.",
    "New Moon weather: fewer witnesses, more honesty with yourself.",
  ],
  "Waxing Crescent": [
    "The Waxing Crescent asks for a first visible step — small, real, named.",
    "Crescent light is growing. Feed one hope with one concrete action.",
    "Waxing Crescent: protect the tender start; don't overexplain it yet.",
  ],
  "First Quarter": [
    "First Quarter brings honest friction — choose the effort that builds, not the fight that drains.",
    "Quarter Moon tension can be useful. Push on the door that opens toward care.",
    "First Quarter: decision weather. Pick one and bless it.",
  ],
  "Waxing Gibbous": [
    "Waxing Gibbous is refine-and-tend energy — polish what already wants to live.",
    "The moon is almost full. Adjust, polish, invite one person into the almost.",
    "Gibbous light: improve the craft without abandoning the heart of it.",
  ],
  "Full Moon": [
    "Full Moon illuminates what was half-said — name it kindly and let some of it go.",
    "Under a Full Moon, feelings run bright. Share warmth; don't prosecute the dark.",
    "Full Moon weather: revelation with mercy. Celebrate and release in the same breath.",
  ],
  "Waning Gibbous": [
    "Waning Gibbous favors gratitude and teaching — pass along what the bright night taught you.",
    "The light is softening. Offer a lesson without needing to be the hero of it.",
    "Waning Gibbous: share the harvest, then rest the field a little.",
  ],
  "Last Quarter": [
    "Last Quarter is honest clearing — compost one habit that no longer feeds you.",
    "Quarter waning: cut what is finished so the next new can breathe.",
    "Last Quarter weather: release with dignity, not drama.",
  ],
  "Waning Crescent": [
    "Waning Crescent is rest-before-rebirth — leave margin; the dark is fertile.",
    "Crescent fading: dream, recover, stop forcing the old story closed with force.",
    "Waning Crescent favors soft endings and deep sleep as strategy.",
  ],
};

const RELATION_LINES: Record<SkyRelation, string[]> = {
  "same-sign": [
    "The Moon is visiting your sun sign — feelings and identity speak the same language today.",
    "Moon on your sun: emotional weather matches your nature. Trust the familiar current.",
  ],
  "same-element": [
    "The Moon shares your element — support arrives in a dialect you already understand.",
    "Element kinship with today's Moon: less translation required between heart and will.",
  ],
  opposite: [
    "The Moon sits across from your sun — mirror weather. Notice who reflects you back.",
    "Opposition day: the other side of the sky holds a useful contrast. Listen before you argue.",
  ],
  square: [
    "A square from the Moon to your sun — productive friction. Aim it at a problem, not a person.",
    "Square aspect weather: the rub is information. Adjust the angle instead of forcing the lock.",
  ],
  harmonious: [
    "A harmonious Moon-to-sun angle eases cooperation — ask for help and mean it.",
    "Soft aspect between Moon and your sun: connection wants less armor today.",
  ],
  neutral: [
    "The Moon moves through a different neighborhood than your sun — curiosity over certainty.",
    "Transit Moon and natal sun are in conversation, not conflict. Stay available to surprise.",
  ],
};

function pickLine(list: string[], day: number, salt: number, stream: number): string {
  const idx = (((day + Math.imul(salt, stream)) % list.length) + list.length) % list.length;
  return list[idx];
}

export function skyProseLine(
  natalSunName: string,
  sky: SkySnapshot,
  day: number,
  salt: number,
): string {
  const relation = moonToNatalRelation(natalSunName, sky.moonSign);
  const phase = pickLine(PHASE_LINES[sky.moonPhase], day, salt, 3);
  const relationLine = pickLine(RELATION_LINES[relation], day, salt, 5);
  return `Sky now: Sun in ${sky.sunSign}, Moon in ${sky.moonSign} (${sky.moonPhase}). ${phase} ${relationLine}`;
}

export function skyLabel(sky: SkySnapshot): string {
  return `Sun ${sky.sunSymbol} ${sky.sunSign} · Moon ${sky.moonSymbol} ${sky.moonSign} · ${sky.moonPhase}`;
}
