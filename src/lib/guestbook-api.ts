import { submitGuestbookNoteFn } from "@/lib/guestbook.functions";
import { getSupabase } from "@/lib/supabase";

export type GuestbookNote = {
  id: string;
  name: string;
  message: string;
  reaction: string;
  ip_address: string | null;
  user_agent: string | null;
  device_label: string | null;
  network_label: string | null;
  created_at: string;
};

export async function submitGuestbookNote(input: {
  name: string;
  message: string;
  reaction: string;
}): Promise<{ emailed: boolean; emailReason?: string }> {
  const result = await submitGuestbookNoteFn({ data: input });
  return { emailed: result.emailed, emailReason: result.emailReason };
}

export async function fetchGuestbookNotes(): Promise<GuestbookNote[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Guestbook is not connected yet.");

  const { data, error } = await supabase
    .from("guestbook_notes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []) as GuestbookNote[];
}
