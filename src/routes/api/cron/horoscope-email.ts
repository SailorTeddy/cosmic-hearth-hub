import { createFileRoute } from "@tanstack/react-router";
import { sendDailyHoroscopeEmail } from "@/lib/horoscope-email";

/**
 * Vercel Cron — emails each family member their own daily stars via Resend.
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
              ok: result.ok,
              dryRun: result.dryRun,
              sent: result.results.filter((r) => r.sent).length,
              results: result.results.map((r) => ({
                id: r.id,
                name: r.name,
                to: r.to,
                subject: r.subject,
                sent: r.sent,
                reason: r.reason,
              })),
            },
            { status: result.ok ? 200 : 500 },
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
