import { Golos_Text, Literata } from "next/font/google";

// Design concept faces (resource/design/tokens.json): Golos Text for body/UI, Literata for years,
// era names and titles. Both ship cyrillic-ext, which holds the Kyrgyz letters Ң Ө Ү (U+04A2, U+04E8, U+04AE).
// Shared by the two root layouts (site and admin) so the font files are loaded once.
export const golos = Golos_Text({
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

export const fontClassName = `${golos.variable} ${literata.variable}`;
