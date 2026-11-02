import { Resend } from "resend";
import { FAMILY_BIRTHDAYS, type FamilyMember } from "@/data/family";
import { dailyReading, getZodiacSign, type DailyReading, type ZodiacSign } from "@/lib/astrology";

export type PersonEmailResult = {
  id: string;
  name: string;
  to: string;
  subject: string;
  sent: boolean;
  reason?: string;
};

export type HoroscopeEmailBatchResult = {
  ok: boolean;
  dryRun: boolean;
  results: PersonEmailResult[];
};

type PersonBundle = {
  person: FamilyMember;
  sign: ZodiacSign;
  reading: DailyReading;
  to: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Optional JSON override: {"emmanuel":"a@b.com","monica":"c@d.com"} */
function emailOverrides(): Record<string, string> {
  const raw = process.env.HOROSCOPE_EMAIL_MAP?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([id, email]) => [id.trim().toLowerCase(), String(email).trim()])
        .filter(([, email]) => email.includes("@")),
    );
  } catch {
    console.warn("HOROSCOPE_EMAIL_MAP is not valid JSON");
    return {};
  }
}

export function buildPersonHoroscopeEmail(
  bundle: Omit<PersonBundle, "to">,
  date = new Date(),
): { subject: string; text: string; html: string } {
  const { person, sign, reading } = bundle;
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
  const shortDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
  const send = reading.rite.find((s) => s.step === "Send")?.text ?? "";
  const box = reading.rite.find((s) => s.step === "Box")?.text ?? "";
  const cross = reading.rite.find((s) => s.step === "Cross")?.text ?? "";

  const subject = `${person.name}'s stars · ${shortDate}`;

  const text = [
    `Hey ${person.name} — your Nichols Family stars for ${dateLabel}`,
    "",
    `${sign.symbol} ${sign.name} · ${sign.element}`,
    reading.skyLabel,
    "",
    reading.prose,
    "",
    `Gateway · ${reading.gateway.name}`,
    reading.gateway.line,
    "",
    `Say this once: "${reading.affirmation}"`,
    "",
    "60-second rite",
    `1. Tune — Three slow breaths out, humming low.`,
    `2. ${box}`,
    `3. Cross — ${cross}`,
    `4. Speak — Out loud, once: "${reading.affirmation}"`,
    `5. ${send}`,
    "",
    "https://emnichols.com/#stars",
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,'Times New Roman',serif;background:#0b0714;padding:28px 16px">
      <div style="max-width:560px;margin:0 auto">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#d4af37">
          The Nichols Family
        </p>
        <h1 style="margin:0 0 8px;font-size:28px;color:#f5e6c8">${escapeHtml(person.name)}'s stars</h1>
        <p style="margin:0 0 8px;color:#b7a9c9">${escapeHtml(dateLabel)}</p>
        <p style="margin:0 0 24px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#9a8fb0">${escapeHtml(reading.skyLabel)}</p>

        <section style="margin:0 0 22px;padding:20px 22px;border-radius:16px;background:#161022;border:1px solid rgba(212,175,55,0.28)">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#d4af37">
            ${escapeHtml(sign.symbol)} ${escapeHtml(sign.name)} · ${escapeHtml(sign.element)}
          </p>
          <p style="margin:0 0 16px;line-height:1.55;color:#f0e6d8">${escapeHtml(reading.prose)}</p>
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#d4af37">
            Gateway · ${escapeHtml(reading.gateway.name)}
          </p>
          <p style="margin:0 0 16px;line-height:1.5;color:#e8dcc8">${escapeHtml(reading.gateway.line)}</p>
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#9a8fb0">
            Say this once
          </p>
          <p style="margin:0;font-size:17px;font-style:italic;color:#f5e6c8">
            “${escapeHtml(reading.affirmation)}”
          </p>
        </section>

        <section style="margin:0 0 22px;padding:18px 20px;border-radius:16px;background:#120e1c;border:1px solid rgba(255,255,255,0.08)">
          <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#d4af37">
            Your 60-second rite
          </p>
          <ol style="margin:0;padding-left:18px;color:#e8dcc8;line-height:1.55">
            <li style="margin-bottom:8px"><strong>Tune.</strong> Three slow breaths out, humming low.</li>
            <li style="margin-bottom:8px"><strong>Box.</strong> ${escapeHtml(box.replace(/^Set down /, "").replace(/\.$/, ""))}.</li>
            <li style="margin-bottom:8px"><strong>Cross.</strong> ${escapeHtml(cross)}</li>
            <li style="margin-bottom:8px"><strong>Speak.</strong> Out loud, once: “${escapeHtml(reading.affirmation)}”</li>
            <li><strong>Send.</strong> ${escapeHtml(send.replace(/^Think of /, "").replace(/\.$/, ""))}.</li>
          </ol>
        </section>

        <p style="margin:8px 0 0;text-align:center">
          <a href="https://emnichols.com/#stars" style="color:#d4af37">Open Family Stars →</a>
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export async function sendDailyHoroscopeEmail(options?: {
  date?: Date;
  dryRun?: boolean;
}): Promise<HoroscopeEmailBatchResult> {
  const date = options?.date ?? new Date();
  const dryRun = options?.dryRun === true;

  // Rebuild with the requested date (recipientsForToday uses "now" for reading day)
  const overrides = emailOverrides();
  const bundles: PersonBundle[] = FAMILY_BIRTHDAYS.flatMap((person) => {
    const to = (overrides[person.id] || person.email || "").trim();
    if (!to) return [];
    const sign = getZodiacSign(person.month, person.day);
    const reading = dailyReading(sign.name, date);
    return [{ person, sign, reading, to }];
  });

  if (bundles.length === 0) {
    return {
      ok: false,
      dryRun,
      results: [
        {
          id: "",
          name: "",
          to: "",
          subject: "",
          sent: false,
          reason: "No family emails configured. Add email on a family member or set HOROSCOPE_EMAIL_MAP.",
        },
      ],
    };
  }

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      results: bundles.map((b) => {
        const built = buildPersonHoroscopeEmail(b, date);
        return {
          id: b.person.id,
          name: b.person.name,
          to: b.to,
          subject: built.subject,
          sent: true,
          reason: "dry-run (not sent)",
        };
      }),
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      dryRun,
      results: bundles.map((b) => ({
        id: b.person.id,
        name: b.person.name,
        to: b.to,
        subject: buildPersonHoroscopeEmail(b, date).subject,
        sent: false,
        reason: "RESEND_API_KEY is not set",
      })),
    };
  }

  const from =
    process.env.HOROSCOPE_FROM_EMAIL ||
    process.env.GUESTBOOK_FROM_EMAIL ||
    "The Nichols Family <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const results: PersonEmailResult[] = [];

  for (const bundle of bundles) {
    const { subject, text, html } = buildPersonHoroscopeEmail(bundle, date);
    const { error } = await resend.emails.send({
      from,
      to: [bundle.to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error(`Horoscope email failed for ${bundle.person.name}:`, error);
      results.push({
        id: bundle.person.id,
        name: bundle.person.name,
        to: bundle.to,
        subject,
        sent: false,
        reason: error.message,
      });
    } else {
      results.push({
        id: bundle.person.id,
        name: bundle.person.name,
        to: bundle.to,
        subject,
        sent: true,
      });
    }
  }

  return {
    ok: results.every((r) => r.sent),
    dryRun: false,
    results,
  };
}
