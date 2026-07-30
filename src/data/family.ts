/**
 * Family birthdays for the home-page astrology reader.
 * Edit names + month (1–12) + day. Year is optional (only for display age vibes).
 */
export type FamilyMember = {
  id: string;
  name: string;
  /** 1–12 */
  month: number;
  /** 1–31 */
  day: number;
};

export const FAMILY_BIRTHDAYS: FamilyMember[] = [
  { id: "monica", name: "Monica", month: 2, day: 15 },
  { id: "emmanuel", name: "Emmanuel", month: 8, day: 14 },
  { id: "layla", name: "Layla", month: 8, day: 25 },
];
