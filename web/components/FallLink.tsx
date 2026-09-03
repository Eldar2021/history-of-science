"use client";
import { Link } from "@/i18n/navigation";
import { FALL_FLAG } from "@/lib/timeline/fall";

/** The home CTA: a normal link to the timeline that asks the next page to play the fall. */
export function FallLink({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href="/timeline"
      className={className}
      onClick={() => { try { sessionStorage.setItem(FALL_FLAG, "1"); } catch { /* no storage: plain navigation */ } }}
    >
      {children}
    </Link>
  );
}
