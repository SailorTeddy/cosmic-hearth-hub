import { Resend } from "resend";
import { FAMILY_BIRTHDAYS } from "@/data/family";
import { HOROSCOPE_NOTIFY_EMAILS } from "@/config/site";
import { dailyReading, getZodiacSign } from "@/lib/astrology";

export type HoroscopeEmailResult = {
  sent: boolean;
  to: string[];
  dryRun: boolean;
  reason?: string;
  subject: string;
};

function recipients(): string[] {
  const fromEnv = (process.env.HOROSCOPE_EMAIL_TO ?? "")
    .split(/[\n,]+/)
    .map((e) => e.trim())
    .filter(Boolean);
  if (fromEnv.length > 0) return fromEnv;
  return [...HOROSCOPE_NOTIFY_EMAILS];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildHoroscopeEmail(date = new Date()): {
  subject: string;
  text: string;
  html: string;
} {
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });

  const members = FAMILY_BIRTHDAYS.map((person) => {
    const sign = getZodiacSign(person.month, person.day);
    const reading = dailyReading(sign.name, date);
    return { person, sign, reading };
  });

  const subject = `Nichols Family stars · ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  })}`;

  const textBlocks = members.map(
    ({ person, sign, reading }) =>
      [
        `${person.name} · ${sign.symbol} ${sign.name}`,
        reading.prose,
        "",
        `Gateway · ${reading.gateway.name}`,
        reading.gateway.line,
        "",
        `Say this once: "${reading.affirmation}"`,
        `Send: ${reading.rite.find((s) => s.step === "Send")?.text ?? ""}`,
      ].join("\n"),
  );

  const text = [
    `The Nichols Family — daily stars for ${dateLabel}`,
    "",
    ...textBlocks.flatMap((block, i) => (i === 0 ? [block] : ["", "—", "", block])),
    "",
    "Full rite: https://emnichols.com/#stars",
  ].join("\n");

  const cards = members
    .map(({ person, sign, reading }) => {
      const send = reading.rite.find((s) => s.step === "Send")?.text ?? "";
      return `
      <section style="margin:0 0 28px;padding:20px 22px;border-radius:16px;background:#161022;border:1px solid rgba(212,175,55,0.28)">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#d4af37">
          ${escapeHtml(sign.symbol)} ${escapeHtml(sign.name)} · ${escapeHtml(sign.element)}
        </p>
        <h2 style="margin:0 0 12px;font-size:22px;color:#f5e6c8">${escapeHtml(person.name)}</h2>
        <p style="margin:0 0 16px;line-height:1.55;color:#f0e6d8">${escapeHtml(reading.prose)}</p>
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#d4af37">
          Gateway · ${escapeHtml(reading.gateway.name)}
        </p>
        <p style="margin:0 0 16px;line-height:1.5;color:#e8dcc8">${escapeHtml(reading.gateway.line)}</p>
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#9a8fb0">
          Say this once
        </p>
        <p style="margin:0 0 14px;font-size:17px;font-style:italic;color:#f5e6c8">
          “${escapeHtml(reading.affirmation)}”
        </p>
        <p style="margin:0;font-size:13px;line-height:1.45;color:#b7a9c9">${escapeHtml(send)}</p>
      </section>`;
    })
    .join("");

  const html = `
    <div style="font-family:Georgia,'Times New Roman',serif;background:#0b0714;padding:28px 16px">
      <div style="max-width:560px;margin:0 auto">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#d4af37">
          The Nichols Family
        </p>
        <h1 style="margin:0 0 8px;font-size:28px;color:#f5e6c8">Daily stars</h1>
        <p style="margin:0 0 24px;color:#b7a9c9">${escapeHtml(dateLabel)}</p>
        ${cards}
        <p style="margin:8px 0 0;text-align:center">
          <a href="https://emnichols.com/#stars" style="color:#d4af37">Take the 60-second rite →</a>
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export async function sendDailyHoroscopeEmail(options?: {
  date?: Date;
  dryRun?: boolean;
}): Promise<HoroscopeEmailResult> {
  const date = options?.date ?? new Date();
  const dryRun = options?.dryRun === true;
  const to = recipients();
  const { subject, text, html } = buildHoroscopeEmail(date);

  if (to.length === 0) {
    return {
      sent: false,
      to,
      dryRun,
      subject,
      reason: "No recipients. Set HOROSCOPE_EMAIL_TO or HOROSCOPE_NOTIFY_EMAILS.",
    };
  }

  if (dryRun) {
    return { sent: true, to, dryRun: true, subject, reason: "dry-run (not sent)" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, to, dryRun, subject, reason: "RESEND_API_KEY is not set" };
  }

  const from =
    process.env.HOROSCOPE_FROM_EMAIL ||
    process.env.GUESTBOOK_FROM_EMAIL ||
    "The Nichols Family <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    html,
  });

  if (error) {
    console.error("Horoscope email failed:", error);
    return { sent: false, to, dryRun, subject, reason: error.message };
  }

  return { sent: true, to, dryRun: false, subject };
}
