/** The timeline page plus the @panel slot: an event opened from a card renders over the list (doc/05). */
export default function TimelineLayout({ children, panel }: { children: React.ReactNode; panel: React.ReactNode }) {
  return (
    <>
      {children}
      {panel}
    </>
  );
}
