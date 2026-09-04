"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

/**
 * One panel, two shapes: a sheet rising from the bottom edge on a phone, a dialog in the middle of
 * the screen on anything wider. Used by the language chooser, About and Contact.
 *
 * A native <dialog>, so the focus trap, Escape and the top layer come from the browser rather than
 * from us. The parent owns the open flag; this only mirrors it onto the element.
 */
export function Sheet({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const t = useTranslations("nav");
  /**
   * Set while this component is the one closing the element. Handing over to another panel - the
   * phone's menu opening About - closes this one, and that close must not be reported as the
   * reader dismissing everything, or the panel being opened would be shut again at once.
   */
  const handingOver = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) {
      handingOver.current = true;
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      // Escape closes the element itself and fires this, so the parent's flag follows the browser.
      onClose={() => { if (handingOver.current) handingOver.current = false; else onClose(); }}
      // A click that lands on the dialog element landed on the backdrop, not on the panel.
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
      aria-labelledby={titleId}
      className="animate-sheet-in m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border border-line bg-elevated p-5 text-secondary backdrop-blur-xl backdrop:bg-black/70 sm:m-auto sm:w-[min(92vw,32rem)] sm:rounded-lg sm:p-6"
    >
      {/* The grab handle a phone expects at the top of a sheet; nothing to read, so it is hidden. */}
      <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-muted/30 sm:hidden" />
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className="font-display text-lg leading-snug text-primary">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="-mt-1 shrink-0 rounded-full border border-line px-2.5 py-1 text-sm text-secondary transition hover:border-accent hover:text-primary"
        >
          <span aria-hidden>&times;</span>
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </dialog>
  );
}
