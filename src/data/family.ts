/**
 * Family birthdays for the home-page astrology reader.
 * Edit names + month (1–12) + day. Year is optional (only for display age vibes).
 * Optional email → that person gets their own daily stars message.
 */
export type FamilyMember = {
  id: string;
  name: string;
  /** 1–12 */
  month: number;
  /** 1–31 */
  day: number;
  /** Daily personalized horoscope email (omit to skip) */
  email?: string;
};

export const FAMILY_BIRTHDAYS: FamilyMember[] = [
  { id: "monica", name: "Monica", month: 2, day: 15 },
  {
    id: "emmanuel",
    name: "Emmanuel",
    month: 8,
    day: 14,
    email: "emmanuellovesall@gmail.com",
  },
  { id: "layla", name: "Layla", month: 8, day: 25 },
];
