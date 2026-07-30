import { getSupabase } from "@/lib/supabase";
import type { JournalCategory, JournalEntry } from "@/data/journal";

export type JournalRow = {
  id: string;
  category: JournalCategory;
  date_label: string;
  title: string;
  body: string;
  image_url: string | null;
  image_alt: string | null;
  created_at: string;
  updated_at: string;
};

export type JournalInput = {
  category: JournalCategory;
  date_label: string;
  title: string;
  body: string;
  image_url?: string | null;
  image_alt?: string | null;
};

function mapRow(row: JournalRow): JournalEntry {
  return {
    id: row.id,
    category: row.category,
    date: row.date_label,
    title: row.title,
    body: row.body,
    image: row.image_url ?? undefined,
    imageAlt: row.image_alt ?? undefined,
  };
}

export async function fetchJournalEntries(): Promise<JournalEntry[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as JournalRow[]).map(mapRow);
}

export async function createJournalEntry(input: JournalInput): Promise<JournalEntry> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      category: input.category,
      date_label: input.date_label,
      title: input.title,
      body: input.body,
      image_url: input.image_url ?? null,
      image_alt: input.image_alt ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as JournalRow);
}

export async function updateJournalEntry(
  id: string,
  input: JournalInput,
): Promise<JournalEntry> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase
    .from("journal_entries")
    .update({
      category: input.category,
      date_label: input.date_label,
      title: input.title,
      body: input.body,
      image_url: input.image_url ?? null,
      image_alt: input.image_alt ?? null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as JournalRow);
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.from("journal_entries").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadJournalImage(file: File): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("journal").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });

  if (error) throw error;

  const { data } = supabase.storage.from("journal").getPublicUrl(path);
  return data.publicUrl;
}
