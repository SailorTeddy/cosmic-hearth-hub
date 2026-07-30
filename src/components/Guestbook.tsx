import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { REACTIONS } from "@/config/site";
import { GlassCard, MagneticButton } from "@/components/glass";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";
import { submitGuestbookNote } from "@/lib/guestbook-api";

export function Guestbook() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [reaction, setReaction] = useState(REACTIONS[1].emoji);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("A name and a note, please!");
      return;
    }

    if (!isSupabaseConfigured) {
      toast.error("Guestbook isn't connected yet", {
        description: "Add your Supabase keys to .env, then run supabase/guestbook.sql.",
      });
      return;
    }

    setSending(true);
    setFailed(false);

    try {
      const result = await submitGuestbookNote({ name, message, reaction });
      setSent(true);
      setName("");
      setMessage("");
      if (result.emailed) {
        toast.success("Note sent to the family");
      } else {
        toast.success("Note saved for the family", {
          description: result.emailReason
            ? "Email isn’t set up yet — we still stored your note."
            : undefined,
        });
      }
    } catch (err) {
      setFailed(true);
      toast.error(err instanceof Error ? err.message : "Your note couldn't be sent", {
        description: "Nothing was lost — your message is still here. Try again in a moment.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="guestbook" className="scroll-mt-16 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <header className="mb-8 text-center">
          <h2 className="gold-text text-3xl font-bold sm:text-4xl">The Digital Guestbook</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Leave a note for the family — we read every one in the Estate inbox.
          </p>
        </header>

        <GlassCard className="p-6 sm:p-9" tilt={false}>
          {sent ? (
            <div className="py-10 text-center">
              <p className="text-4xl">💛</p>
              <h3 className="mt-4 text-xl font-bold text-champagne">Note received</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Thank you for orbiting through. We read every single one.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-sm font-semibold text-gold underline-offset-4 hover:underline"
              >
                Leave another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="gb-name" className="mb-2 block text-xs tracking-widest text-gold uppercase">
                  Your name
                </label>
                <input
                  id="gb-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  placeholder="Who's visiting?"
                  className="w-full rounded-lg border border-glass-border bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </div>

              <div>
                <label htmlFor="gb-msg" className="mb-2 block text-xs tracking-widest text-gold uppercase">
                  Your note
                </label>
                <textarea
                  id="gb-msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={600}
                  rows={4}
                  placeholder="Say something sweet, silly, or wildly overdue…"
                  className="w-full resize-none rounded-lg border border-glass-border bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </div>

              <div>
                <span className="mb-2 block text-xs tracking-widest text-gold uppercase">
                  Pick a reaction
                </span>
                <div className="flex flex-wrap gap-3">
                  {REACTIONS.map((r) => (
                    <button
                      key={r.emoji}
                      type="button"
                      aria-label={r.label}
                      aria-pressed={reaction === r.emoji}
                      onClick={() => setReaction(r.emoji)}
                      className={cn(
                        "rounded-lg border px-4 py-3 text-xl transition-all duration-200 hover:-translate-y-1",
                        reaction === r.emoji
                          ? "scale-110 border-gold/60 bg-gold/15 shadow-[var(--shadow-glow)]"
                          : "border-glass-border bg-secondary/60",
                      )}
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {failed && (
                <p role="alert" className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-champagne">
                  We couldn't reach the family mailbox just now — your note is still typed out
                  above, nothing was lost. Give it another tap in a moment.
                </p>
              )}

              <MagneticButton
                type="submit"
                disabled={sending}
                className="w-full bg-gold text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-gold-soft disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send your note"}
              </MagneticButton>
            </form>
          )}
        </GlassCard>
      </div>
    </section>
  );
}
