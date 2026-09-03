/** URL slugs are language-independent and Latin (ADR-005). Cyrillic (ru/ky) and Turkish letters are transliterated. */
const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  // Kyrgyz
  ң: "ng", ө: "o", ү: "u",
  // Turkish
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u",
  // common Latin diacritics
  é: "e", è: "e", ê: "e", á: "a", à: "a", ä: "a", í: "i", ó: "o", ú: "u", ñ: "n", ß: "ss", æ: "ae", ø: "o", ā: "a", ī: "i", ū: "u",
};

export function slugify(input: string): string {
  // toLowerCase: never toLocaleUpperCase here; lowercasing 'I' → 'i' is what a slug wants in every locale.
  const lower = input.normalize("NFC").toLowerCase();
  let out = "";
  for (const ch of lower) out += ch in MAP ? MAP[ch] : ch;
  return out
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
