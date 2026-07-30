import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { deviceLabelFromUa, lookupNetworkHint } from "@/lib/visitor-meta";
import { emailGuestbookNote } from "@/lib/guestbook-email";

const guestbookInput = z.object({
  name: z.string().trim().min(1).max(60),
  message: z.string().trim().min(1).max(600),
  reaction: z.string().trim().min(1).max(16),
});

function getServerSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured on the server.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const submitGuestbookNoteFn = createServerFn({ method: "POST" })
  .validator(guestbookInput)
  .handler(async ({ data }) => {
    const ip =
      getRequestIP({ xForwardedFor: true }) ||
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-real-ip") ||
      "unknown";

    const userAgent = getRequestHeader("user-agent") || "";
    const deviceLabel = deviceLabelFromUa(userAgent);
    const network = await lookupNetworkHint(ip === "unknown" ? null : ip);

    const supabase = getServerSupabase();
    const { error } = await supabase.from("guestbook_notes").insert({
      name: data.name,
      message: data.message,
      reaction: data.reaction,
      ip_address: ip,
      user_agent: userAgent.slice(0, 500),
      device_label: deviceLabel,
      network_label: network.label,
    });

    if (error) {
      console.error("Guestbook insert failed:", error);
      throw new Error(error.message || "Could not save your note.");
    }

    const mail = await emailGuestbookNote({
      name: data.name,
      message: data.message,
      reaction: data.reaction,
      ip,
      deviceLabel,
      networkLabel: network.label,
    });

    if (!mail.sent) {
      console.warn("Guestbook saved but email not sent:", mail.reason);
    }

    return {
      ok: true as const,
      emailed: mail.sent,
      emailReason: mail.reason,
    };
  });
