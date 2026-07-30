## The Nichols Estate — Cosmic Family Hearth

A single-page site at `/` (replacing the placeholder index route). Deep-space canvas, warm gold glass panels, mobile-first.

### Design system
- Palette in `src/styles.css` as oklch tokens: obsidian/indigo background (`#0A0A14` → `#141232`), liquid gold `#D4AF37`, champagne, warm white. Gold micro-glow shadow tokens + glass surface token.
- Radius token set to 20px. Typography: bold modern sans for headers (Sora), relaxed readable body (Manrope), loaded via `<link>` in `__root.tsx`.
- Everything semantic — no hardcoded color utilities.

### Cosmic background (intensity: max)
Full-viewport fixed canvas behind all content: layered parallax starfield, drifting nebula haze, slow gold dust motes, gentle mouse-parallax. Pure Canvas 2D with `requestAnimationFrame`, DPR-capped, particle count scaled down on mobile, paused when tab hidden and when `prefers-reduced-motion` is set — keeps 60fps on phones.

### Sections
**A — Welcome hero card**
Glass panel with a generated glowing cosmic family crest, title "The Nichols Estate", subtitle "Family Updates, Milestones & Space to Connect", warm intro line. Live-greeting badge above it ("Good evening — Welcome to the Nichols Family Hub") computed from the visitor's local time, plus their timezone label.

**B — The Family Journal**
Card feed with filter pills (All / Milestones / Projects / Life), tilt-on-hover glass cards, and a lightbox for photo cards. Entries are static content in a single `src/data/journal.ts` file so you can edit them without touching layout. Placeholder imagery generated to match the cosmic-warm look.

**C — Support the Estate / Send a Blessing**
Casual, non-demanding copy. Gold-accented quick-link tiles:
- Cash App: `$SailorTeddy`, `$Srentz97`
- Zelle: Nichols.Emmanuel@outlook.com, Monica.Rentz97@gmail.com (tap-to-copy)
- PayPal Pool: your pool link
- Venmo tile left out unless you give me a handle

Quick-gift buttons ($10 "Coffee on us", $50 "Family Dinner Fund", Custom amount) wired to Stripe checkout.

**D — Digital Guestbook**
"Leave a Note for the Family" form: Name, Message, emoji reaction bar (🚀 💛 🥂 🏡). Since you don't want data kept in a database, submissions post to a **Google Form** (hidden-field submit) — notes land in your Google Sheet / inbox, nothing stored on the site. I'll need the Google Form URL + field entry IDs from you; until then I'll wire it with a clearly-marked placeholder constant at the top of one file.
Because there's no database, the "recent messages" carousel will scroll a curated set of sample/family notes you can edit in `src/data/guestbook.ts` rather than live visitor submissions.

**Footer** — minimal, gold hairline, family mark.

### SEO
Route `head()` with title "The Nichols Estate — Family Hub", warm description, og/twitter tags, og:image pointing at the generated cosmic crest once it has an absolute URL.

### Technical notes
- Motion via CSS transforms + a light `motion` usage for card transitions; magnetic hover on buttons via pointer-relative transform.
- Responsive rules: grid header patterns, `min-w-0` + `truncate`, `shrink-0` icons.
- Stripe: enabling Lovable payments requires a Pro plan. I'll run the provider check, enable Stripe, create the $10 / $50 / custom gift products, then wire a checkout server function. If you'd rather skip Stripe for now, the handle tiles alone still fully work.

### What I need from you
1. Google Form URL for the guestbook (or say "placeholder for now").
2. A Venmo handle, if you want that tile.
