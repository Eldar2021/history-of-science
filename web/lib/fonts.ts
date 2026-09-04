import { Literata, Onest } from "next/font/google";

// Onest for body and UI, Literata for years, era names and titles. Both ship cyrillic-ext, which
// holds the Kyrgyz letters Ң Ө Ү (U+04A2, U+04E8, U+04AE), and both draw Turkish ğ with its breve -
// which is why the body face is no longer Golos Text (CLAUDE.md font rule). Shared by the two root layouts
// (site and admin) so the font files are loaded once.
export const sans = Onest({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

export const literata = Literata({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  axes: ["opsz"],
  display: "swap",
});

export const fontClassName = `${sans.variable} ${literata.variable}`;
