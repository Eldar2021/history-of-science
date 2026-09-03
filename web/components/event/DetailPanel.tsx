"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";

type Props = { children: React.ReactNode; closeLabel: string; labelledBy: string };

/**
 * The event detail over the timeline: a full-screen sheet on phones, a right-hand panel on
 * desktop. The timeline stays mounted underneath (intercepting route), so closing restores the exact
 * scroll position. Back button, Esc, the backdrop and the close button all close it.
 */
export function DetailPanel({ children, closeLabel, labelledBy }: Props) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);

  function close() {
    // The panel only exists after a soft navigation from the timeline (a hard load renders the full page),
    // so there is always a history entry to go back to. A replace() would leave the slot open: Next keeps
    // a parallel slot's state on soft navigation and only falls back to default.tsx on a hard load.
    router.back();
  }

  useEffect(() => {
    // Focus trap: the page behind the dialog goes inert; focus returns to the opener (the card) on close.
    const opener = document.activeElement as HTMLElement | null;
    const behind = Array.from(document.querySelectorAll<HTMLElement>("body > div > header, body > div > main, body > div > footer, body > header, body > main, body > footer"));
    behind.forEach((el) => { el.inert = true; });
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => {
      behind.forEach((el) => { el.inert = false; });
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-20">
      <button type="button" tabIndex={-1} aria-hidden onClick={close} className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="absolute inset-x-0 bottom-0 top-8 flex flex-col rounded-t-card bg-base shadow-lg animate-sheet-in md:inset-y-0 md:left-auto md:right-0 md:w-[30rem] md:rounded-none md:border-l md:border-line md:animate-panel-in"
      >
        <div className="flex shrink-0 items-center justify-end px-4 pt-3">
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={closeLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-pill border border-line text-secondary hover:text-primary"
          >
            <span aria-hidden className="text-lg leading-none">×</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-y-contain px-5 pb-10 pt-1 md:px-6">{children}</div>
      </div>
    </div>
  );
}
