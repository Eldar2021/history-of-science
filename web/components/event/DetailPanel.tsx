"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "@/i18n/navigation";
import { PANEL_DEFAULT_PX, PANEL_MIN_PX, PANEL_STEP_PX } from "@/lib/panelWidth";
import {
  getMaxPanelWidth,
  getPanelWidth,
  getServerMaxPanelWidth,
  getServerPanelWidth,
  setPanelWidth,
  subscribe,
} from "./panelWidthStore";

type Props = { children: React.ReactNode; closeLabel: string; resizeLabel: string; labelledBy: string };

/**
 * The event detail over the timeline: a full-screen sheet on phones, a right-hand panel on
 * desktop. The timeline stays mounted underneath (intercepting route), so closing restores the exact
 * scroll position. Back button, Esc, the backdrop and the close button all close it.
 *
 * On desktop the left edge is a drag handle: 30rem is too narrow for a long body, and how wide is
 * comfortable depends on the screen, so the reader decides and the browser remembers. The handle is
 * a separator in the ARIA sense - arrow keys move it, double click puts it back - and it does not
 * exist on a phone, where the sheet is as wide as the screen anyway.
 *
 * It wears the same clothes as `components/Sheet.tsx` - translucent, blurred, a grab handle on a
 * phone - so the site has one panel, not two. It is not a <dialog> like that one: closing has to go
 * through router.back() for the intercepting route, and a nested <dialog> bubbles its close event
 * into the one behind it.
 */
export function DetailPanel({ children, closeLabel, resizeLabel, labelledBy }: Props) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const width = useSyncExternalStore(subscribe, getPanelWidth, getServerPanelWidth);
  const maxWidth = useSyncExternalStore(subscribe, getMaxPanelWidth, getServerMaxPanelWidth);

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

  function onHandleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // The panel hangs on the right edge, so moving the separator left makes it wider.
    const target =
      e.key === "ArrowLeft" ? width + PANEL_STEP_PX
      : e.key === "ArrowRight" ? width - PANEL_STEP_PX
      : e.key === "Home" ? maxWidth
      : e.key === "End" ? PANEL_MIN_PX
      : null;
    if (target === null) return;
    e.preventDefault();
    setPanelWidth(target, { remember: true });
  }

  return (
    <div className="fixed inset-0 z-20">
      <button type="button" tabIndex={-1} aria-hidden onClick={close} className="absolute inset-0 bg-black/70 md:bg-black/45" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        style={{ "--panel-w": `${width}px` } as React.CSSProperties}
        className="animate-sheet-in absolute inset-x-0 bottom-0 top-8 flex flex-col rounded-t-2xl border border-line bg-elevated shadow-lg backdrop-blur-xl md:inset-y-0 md:left-auto md:right-0 md:w-[var(--panel-w)] md:rounded-none md:border-y-0 md:border-r-0 md:animate-panel-in"
      >
        {/* The width control. Pointer capture keeps the moves coming when the cursor outruns the edge. */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={resizeLabel}
          aria-valuenow={width}
          aria-valuemin={PANEL_MIN_PX}
          aria-valuemax={maxWidth}
          tabIndex={0}
          data-panel-resize
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = true;
            document.body.style.userSelect = "none";
          }}
          onPointerMove={(e) => { if (dragging.current) setPanelWidth(window.innerWidth - e.clientX); }}
          onPointerUp={(e) => {
            if (!dragging.current) return;
            e.currentTarget.releasePointerCapture(e.pointerId);
            dragging.current = false;
            document.body.style.userSelect = "";
            setPanelWidth(window.innerWidth - e.clientX, { remember: true });
          }}
          onDoubleClick={() => setPanelWidth(PANEL_DEFAULT_PX, { remember: true })}
          onKeyDown={onHandleKeyDown}
          className="group absolute inset-y-0 left-0 z-10 hidden w-4 -translate-x-1/2 cursor-col-resize touch-none items-center justify-center outline-none md:flex"
        >
          <span
            aria-hidden
            className="h-10 w-1 rounded-full bg-muted/30 transition-[background-color,height] group-hover:h-16 group-hover:bg-accent group-focus-visible:h-16 group-focus-visible:bg-accent group-active:h-16 group-active:bg-accent"
          />
        </div>
        <div className="flex shrink-0 items-center justify-end px-4 pt-3">
          {/* The grab handle a phone expects at the top of a sheet; nothing to read, so it is hidden. */}
          <span aria-hidden className="absolute inset-x-0 top-3 mx-auto h-1 w-10 rounded-full bg-muted/30 md:hidden" />
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={closeLabel}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-pill border border-line text-secondary transition hover:border-accent hover:text-primary"
          >
            <span aria-hidden className="text-lg leading-none">×</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-y-contain px-5 pb-10 pt-1 md:px-6">{children}</div>
      </div>
    </div>
  );
}
