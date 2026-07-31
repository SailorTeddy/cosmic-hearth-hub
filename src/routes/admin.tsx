import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { Pencil, Plus, Trash2, LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { CosmicBackground } from "@/components/CosmicBackground";
import { GlassCard } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JournalCategory, JournalEntry } from "@/data/journal";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  createJournalEntry,
  deleteJournalEntry,
  fetchJournalEntries,
  updateJournalEntry,
  uploadJournalImage,
  type JournalInput,
} from "@/lib/journal-api";
import { fetchGuestbookNotes } from "@/lib/guestbook-api";
import { fetchBlessingStars } from "@/lib/blessing-stars-api";
import { FAMILY_SIDE_LABELS } from "@/lib/blessing-stars";
const CATEGORIES: JournalCategory[] = ["Milestones", "Projects", "Life"];

const emptyForm: JournalInput = {
  category: "Life",
  date_label: "",
  title: "",
  body: "",
  image_url: null,
  image_alt: "",
};

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Family Journal Admin — The Nichols Estate" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let mounted = true;
    const finish = (next: Session | null) => {
      if (!mounted) return;
      setSession(next);
      setAuthReady(true);
    };

    // Don't hang forever if Supabase is unreachable
    const timeout = window.setTimeout(() => {
      finish(null);
      toast.error("Could not reach Supabase — check your project URL");
    }, 8000);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        window.clearTimeout(timeout);
        finish(data.session);
      })
      .catch((err: Error) => {
        window.clearTimeout(timeout);
        console.error("Supabase getSession failed:", err);
        finish(null);
        toast.error(err.message || "Could not reach Supabase");
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <CosmicBackground />
      <main className="relative mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-champagne"
          >
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
          <h1 className="gold-text text-lg font-bold sm:text-xl">Journal Admin</h1>
        </div>

        {!isSupabaseConfigured ? (
          <SetupInstructions />
        ) : !authReady ? (
          <p className="text-center text-sm text-muted-foreground">Checking session…</p>
        ) : session ? (
          <AdminEditor
            email={session.user.email ?? "signed in"}
            onSignOut={async () => {
              await getSupabase()?.auth.signOut();
              toast.success("Signed out");
            }}
          />
        ) : (
          <LoginForm />
        )}
      </main>
    </>
  );
}

function SetupInstructions() {
  return (
    <GlassCard tilt={false} className="space-y-4 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-champagne">Connect Supabase</h2>
      <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>
          Create a free project at{" "}
          <a
            className="text-gold underline-offset-2 hover:underline"
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
          >
            supabase.com
          </a>
          .
        </li>
        <li>
          In the SQL Editor, paste and run{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-champagne">
            supabase/schema.sql
          </code>
          .
        </li>
        <li>
          Authentication → Providers → Email: enable Email. Turn{" "}
          <strong className="text-champagne">off</strong> “Enable sign ups” so only accounts
          you create can log in.
        </li>
        <li>
          Authentication → Users → Add user (email + password for your family login).
        </li>
        <li>
          Project Settings → API → copy Project URL and anon public key into a{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-champagne">.env</code> file
          (see <code className="rounded bg-secondary px-1.5 py-0.5 text-champagne">.env.example</code>
          ).
        </li>
        <li>Restart the dev server, then refresh this page.</li>
      </ol>
    </GlassCard>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
  };

  return (
    <GlassCard tilt={false} className="p-6 sm:p-8">
      <h2 className="text-xl font-bold text-champagne">Family login</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to add or edit journal posts. Only your family account can change the feed.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gold text-primary-foreground hover:bg-gold/90">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </GlassCard>
  );
}

function AdminEditor({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<JournalInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: fetchJournalEntries,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) return updateJournalEntry(editingId, form);
      return createJournalEntry(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      setForm(emptyForm);
      setEditingId(null);
      toast.success(editingId ? "Post updated" : "Post published");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      if (editingId) {
        setEditingId(null);
        setForm(emptyForm);
      }
      toast.success("Post deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const startEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setForm({
      category: entry.category,
      date_label: entry.date,
      title: entry.title,
      body: entry.body,
      image_url: entry.image ?? null,
      image_alt: entry.imageAlt ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadJournalImage(file);
      setForm((prev) => ({ ...prev, image_url: url }));
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <GlassCard tilt={false} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="text-champagne">{email}</span>
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => void onSignOut()}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </GlassCard>

      <GlassCard tilt={false} className="p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-champagne">
            {editingId ? "Edit post" : "New post"}
          </h2>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel edit
            </Button>
          )}
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value as JournalCategory }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-background text-foreground">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_label">Date label</Label>
              <Input
                id="date_label"
                placeholder="July 2026"
                required
                value={form.date_label}
                onChange={(e) => setForm((prev) => ({ ...prev, date_label: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              required
              rows={5}
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Photo (optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => void onUpload(e.target.files?.[0] ?? null)}
            />
            {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
            {form.image_url && (
              <div className="mt-2 overflow-hidden rounded-lg border border-glass-border">
                <img src={form.image_url} alt="" className="max-h-48 w-full object-cover" />
                <button
                  type="button"
                  className="w-full bg-secondary px-3 py-2 text-xs text-muted-foreground hover:text-champagne"
                  onClick={() => setForm((prev) => ({ ...prev, image_url: null }))}
                >
                  Remove photo
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_alt">Photo description (optional)</Label>
            <Input
              id="image_alt"
              value={form.image_alt ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, image_alt: e.target.value }))}
            />
          </div>

          <Button
            type="submit"
            disabled={saveMutation.isPending || uploading}
            className="w-full bg-gold text-primary-foreground hover:bg-gold/90"
          >
            <Plus className="size-4" />
            {saveMutation.isPending
              ? "Saving…"
              : editingId
                ? "Save changes"
                : "Publish post"}
          </Button>
        </form>
      </GlassCard>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-champagne">Existing posts</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && entries.length === 0 && (
          <p className="text-sm text-muted-foreground">No posts yet — publish your first one above.</p>
        )}
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <GlassCard tilt={false} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold tracking-widest text-gold uppercase">
                      {entry.category} · {entry.date}
                    </p>
                    <h3 className="mt-1 font-semibold text-champagne">{entry.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{entry.body}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => startEdit(entry)}>
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm(`Delete “${entry.title}”?`)) {
                          deleteMutation.mutate(entry.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      </section>

      <BlessingStarsInbox />
      <GuestbookInbox />
    </div>
  );
}

function BlessingStarsInbox() {
  const { data: stars = [], isLoading, isError, error } = useQuery({
    queryKey: ["blessing-stars"],
    queryFn: fetchBlessingStars,
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-champagne">Blessing stars</h2>
      {isLoading && <p className="text-sm text-muted-foreground">Loading stars…</p>}
      {isError && (
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Could not load blessing stars."} If this is
          your first time, run <code className="text-champagne">supabase/blessing-stars.sql</code>{" "}
          in the SQL Editor.
        </p>
      )}
      {!isLoading && !isError && stars.length === 0 && (
        <p className="text-sm text-muted-foreground">No blessing stars claimed yet.</p>
      )}
      <ul className="space-y-3">
        {[...stars].reverse().map((star) => (
          <li key={star.id}>
            <GlassCard tilt={false} className="p-4 sm:p-5">
              <p className="font-semibold text-champagne">✦ {star.name}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{FAMILY_SIDE_LABELS[star.family_side]}</span>
                <span>
                  {star.members.length || star.star_count}{" "}
                  {(star.members.length || star.star_count) === 1 ? "star" : "stars"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block size-2.5 rounded-full border border-white/30"
                    style={{ backgroundColor: star.color }}
                  />
                  {star.color}
                </span>
              </p>
              {star.message ? (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{star.message}</p>
              ) : null}
              {star.members.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {star.members.map((m, i) => (
                    <li key={`${star.id}-${i}`} className="flex items-start gap-2">
                      <span
                        className="mt-1 inline-block size-2 shrink-0 rounded-full border border-white/25"
                        style={{ backgroundColor: m.color || star.color }}
                      />
                      <span>
                        <span className="text-champagne">{m.name}</span>
                        {m.personality ? ` — ${m.personality}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(star.created_at).toLocaleString()}
              </p>
            </GlassCard>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GuestbookInbox() {
  const { data: notes = [], isLoading, isError, error } = useQuery({
    queryKey: ["guestbook-notes"],
    queryFn: fetchGuestbookNotes,
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-champagne">Guestbook inbox</h2>
      {isLoading && <p className="text-sm text-muted-foreground">Loading notes…</p>}
      {isError && (
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Could not load guestbook notes."} If this is
          your first time, run <code className="text-champagne">supabase/guestbook.sql</code> in
          the SQL Editor.
        </p>
      )}
      {!isLoading && !isError && notes.length === 0 && (
        <p className="text-sm text-muted-foreground">No guestbook notes yet.</p>
      )}
      <ul className="space-y-3">
        {notes.map((note) => (
          <li key={note.id}>
            <GlassCard tilt={false} className="p-4 sm:p-5">
              <div className="min-w-0">
                <p className="font-semibold text-champagne">
                  {note.reaction} {note.name}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{note.message}</p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>{new Date(note.created_at).toLocaleString()}</p>
                  {note.ip_address && <p>IP: {note.ip_address}</p>}
                  {note.device_label && <p>Device: {note.device_label}</p>}
                  {note.network_label && <p>Network: {note.network_label}</p>}
                </div>
              </div>
            </GlassCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
