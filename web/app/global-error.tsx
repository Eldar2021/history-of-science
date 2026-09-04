"use client";
import "./globals.css";

/**
 * The last resort: a failure in the root layout itself, where there is no locale, no provider and no
 * translations to reach for. It replaces the whole document, so it brings its own <html> and <body>.
 * English only, on purpose - the machinery that would pick a language is what just broke.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-full flex-col items-start gap-4 bg-base px-6 py-24 text-primary">
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="max-w-prose text-secondary">
          The page could not be built. This is our fault, not yours. Try again, and if it keeps happening,
          the address below tells us which failure it was.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <button type="button" onClick={reset} className="rounded-pill bg-accent px-5 py-2 font-medium text-accent-ink transition hover:bg-accent-hover">
            Try again
          </button>
          {/* A plain link on purpose: the root layout is what failed, so the way out is a fresh document,
              not a client navigation that would rebuild the same broken tree. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="text-accent-text underline underline-offset-4">Back to the start</a>
        </div>
        {error.digest && <p className="mt-4 font-mono text-xs text-muted">Reference: {error.digest}</p>}
      </body>
    </html>
  );
}
