import { Resend } from "resend";
import { GUESTBOOK_NOTIFY_EMAILS } from "@/config/site";

export async function emailGuestbookNote(input: {
  name: string;
  message: string;
  reaction: string;
  ip: string;
  deviceLabel: string;
  networkLabel: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY is not set" };
  }

  const from = process.env.GUESTBOOK_FROM_EMAIL || "The Nichols Estate <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  const subject = `Guestbook note from ${input.name}`;
  const text = [
    `${input.reaction} New guestbook note`,
    "",
    `From: ${input.name}`,
    `Message: ${input.message}`,
    "",
    `IP: ${input.ip}`,
    `Device: ${input.deviceLabel}`,
    `Network: ${input.networkLabel}`,
    "",
    "Note: Network/device info is approximate (ISP + browser). It cannot identify a legal device owner by name.",
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;line-height:1.5;color:#1a1528">
      <h2 style="margin:0 0 12px">${input.reaction} New guestbook note</h2>
      <p><strong>From:</strong> ${escapeHtml(input.name)}</p>
      <p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0" />
      <p style="font-size:13px;color:#555">
        <strong>IP:</strong> ${escapeHtml(input.ip)}<br/>
        <strong>Device:</strong> ${escapeHtml(input.deviceLabel)}<br/>
        <strong>Network:</strong> ${escapeHtml(input.networkLabel)}
      </p>
      <p style="font-size:12px;color:#888">
        Network/device info is approximate (ISP + browser). It cannot identify a legal device owner by name.
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to: [...GUESTBOOK_NOTIFY_EMAILS],
    subject,
    text,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return { sent: false, reason: error.message };
  }

  return { sent: true };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
