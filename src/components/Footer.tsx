import crest from "@/assets/crest.png";

export function Footer() {
  return (
    <footer className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <div className="h-px bg-[linear-gradient(90deg,transparent,var(--glass-border),transparent)]" />
      <div className="mt-8 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
        <img
          src={crest}
          alt=""
          width={1024}
          height={1024}
          loading="lazy"
          className="size-10 shrink-0 opacity-80"
        />
        <p className="min-w-0 text-xs text-muted-foreground">
          The Nichols Estate — emnichols.com. Built with warm light and a lot of stars.{" "}
          <a href="/admin" className="opacity-40 transition-opacity hover:opacity-80">
            Family login
          </a>
        </p>
      </div>
    </footer>
  );
}
