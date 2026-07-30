/** Parse a user-agent into a short device/browser label (not an owner name). */
export function deviceLabelFromUa(ua: string | null | undefined): string {
  if (!ua) return "Unknown device";

  const browser =
    /Edg\//.test(ua)
      ? "Edge"
      : /Chrome\//.test(ua) && !/Chromium\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua) && !/Chrome\//.test(ua)
            ? "Safari"
            : "Browser";

  let device = "Computer";
  if (/iPhone/.test(ua)) device = "iPhone";
  else if (/iPad/.test(ua)) device = "iPad";
  else if (/Android/.test(ua) && /Mobile/.test(ua)) device = "Android phone";
  else if (/Android/.test(ua)) device = "Android tablet";
  else if (/Windows/.test(ua)) device = "Windows PC";
  else if (/Mac OS X/.test(ua)) device = "Mac";
  else if (/Linux/.test(ua)) device = "Linux";
  else if (/CrOS/.test(ua)) device = "Chromebook";

  return `${device} · ${browser}`;
}

export type NetworkHint = {
  label: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
};

/** Best-effort network hint from IP. This is ISP/location — never a personal name. */
export async function lookupNetworkHint(ip: string | null): Promise<NetworkHint> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { label: "Local / private network" };
  }

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return { label: "Network lookup unavailable" };
    const data = (await res.json()) as {
      error?: boolean;
      reason?: string;
      city?: string;
      region?: string;
      country_name?: string;
      org?: string;
    };
    if (data.error) return { label: data.reason || "Network lookup unavailable" };

    const place = [data.city, data.region, data.country_name].filter(Boolean).join(", ");
    const isp = data.org?.trim();
    const label = [isp, place].filter(Boolean).join(" · ") || "Unknown network";
    return {
      label,
      city: data.city,
      region: data.region,
      country: data.country_name,
      isp,
    };
  } catch {
    return { label: "Network lookup unavailable" };
  }
}
