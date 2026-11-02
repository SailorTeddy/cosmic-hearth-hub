import { createFileRoute } from "@tanstack/react-router";
import { sendDailyHoroscopeEmail } from "@/lib/horoscope-email";

/**
 * Vercel Cron — emails the family's daily stars via Resend.
 * Schedule: 11:00 UTC daily ≈ 6am Eastern (7am during daylight saving).
 * Secured with CRON_SECRET (Authorization: Bearer …).
 *
 * Manual test:
 *   GET /api/cron/horoscope-email?dryRun=1
 */
export const Route = createFileRoute("/api/cron/horoscope-email")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        const auth = request.headers.get("authorization");
        if (!secret || auth !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        const url = new URL(request.url);
        const dryRun = url.searchParams.get("dryRun") === "1";

        try {
          const result = await sendDailyHoroscopeEmail({ dryRun });
          return Response.json(
            {
              ok: result.sent,
              dryRun: result.dryRun,
              to: result.to,
              subject: result.subject,
              reason: result.reason,
            },
            { status: result.sent ? 200 : 500 },
          );
        } catch (error) {
          console.error("horoscope-email cron failed", error);
          return Response.json(
            {
              ok: false,
              reason: error instanceof Error ? error.message : "Email cron failed",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
