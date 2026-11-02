import { createFileRoute } from "@tanstack/react-router";
import { sendDailyHoroscopeEmail } from "@/lib/horoscope-email";
import { timingSafeEqualString } from "@/lib/security";

/**
 * Vercel Cron — emails each family member their own daily stars via Resend.
 * Schedule: 11:00 UTC daily ≈ 6am Eastern (7am during daylight saving).
 * Secured with CRON_SECRET (Authorization: Bearer …). Timing-safe compare.
 *
 * Manual test:
 *   GET /api/cron/horoscope-email?dryRun=1
 *   Authorization: Bearer $CRON_SECRET
 */
export const Route = createFileRoute("/api/cron/horoscope-email")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.CRON_SECRET?.trim() ?? "";
        if (!secret) {
          console.error("CRON_SECRET is not configured");
          return new Response("Unauthorized", { status: 401 });
        }

        const auth = request.headers.get("authorization") ?? "";
        const expected = `Bearer ${secret}`;
        if (!timingSafeEqualString(auth, expected)) {
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
              reason: "Email cron failed",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
