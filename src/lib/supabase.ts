import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readViteEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const raw = import.meta.env[name];
    if (typeof raw !== "string") continue;
    const value = raw.trim();
    if (value) return value;
  }
  return undefined;
}

const url = readViteEnv("VITE_SUPABASE_URL");
const anonKey = readViteEnv(
  "VITE_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
);

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Browser Supabase client. Returns null when env vars are missing. */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
