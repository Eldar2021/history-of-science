import type { Era, TimelineEvent } from "@/lib/queries/types";
import type { Locale } from "@/lib/i18n/formatYear";

/** Used when Supabase env is missing, so the site runs before the database exists. Mirrors seed.sql. */
const E = (
  slug: string, year: number, precision: TimelineEvent["precision"], era_id: number,
  disciplines: string[], title: string, summary: string,
): Omit<TimelineEvent, "locale_used" | "is_fallback"> => ({
  id: slug, slug, year, year_end: null, precision, era_id, importance: 5, image_path: null,
  title, summary, translation_status: "human", disciplines,
});

const EVENTS = [
  E("thales-natural-explanations", -585, "circa", 1, ["physics", "astronomy"], "Thales looks for natural causes",
    "A man in Miletus proposes that the world can be explained without gods. The story that he predicted an eclipse is probably legend, but the habit of asking \"why\" is real."),
  E("euclid-elements", -300, "circa", 1, ["mathematics"], "Euclid writes the Elements",
    "Thirteen books that build all of geometry from a handful of definitions and five postulates. It stayed a textbook for over two thousand years."),
  E("archimedes-buoyancy-levers", -250, "circa", 1, ["physics", "mathematics"], "Archimedes: buoyancy, levers and the value of pi",
    "In Syracuse, Archimedes works out why things float, how levers multiply force, and squeezes pi between two numbers using polygons."),
  E("eratosthenes-earth-circumference", -240, "circa", 1, ["astronomy", "earth"], "Eratosthenes measures the Earth",
    "Using the angle of a shadow in Alexandria and the distance to a well in Syene, a librarian computes the circumference of the planet to within a few percent."),
  E("al-khwarizmi-algebra", 820, "circa", 2, ["mathematics"], "Al-Khwarizmi founds algebra",
    "In Baghdad, a scholar from Khwarezm writes a book on \"restoring and balancing\" equations. Its title gives us the word algebra; his name gives us algorithm."),
  E("ibn-al-haytham-optics", 1021, "circa", 2, ["physics"], "Ibn al-Haytham explains vision with experiments",
    "Working in a darkened room, Ibn al-Haytham shows that we see because light enters the eye, not because the eye sends out rays, and insists that claims be tested."),
  E("ulugh-beg-observatory", 1420, "exact", 3, ["astronomy"], "Ulugh Beg builds the Samarkand observatory",
    "A ruler-astronomer builds a giant sextant and, with his team, catalogues over a thousand stars with naked-eye precision unmatched until Tycho Brahe."),
  E("copernicus-heliocentrism", 1543, "exact", 3, ["astronomy"], "Copernicus puts the Sun at the center",
    "Published as he lay dying, On the Revolutions argues that the Earth moves around the Sun. The idea was old; the full mathematical system was new."),
  E("newton-principia", 1687, "exact", 3, ["physics", "astronomy", "mathematics"], "Newton publishes the Principia",
    "The fall of an apple and the orbit of the Moon obey one law. Sky and earth become one physics."),
  E("transistor", 1947, "exact", 7, ["physics", "technology"], "The transistor is invented",
    "At Bell Labs, Bardeen, Brattain and Shockley make a tiny crystal amplify an electric signal. Every computer, phone and satellite descends from it."),
];

const ERA_NAMES: Record<Locale, string[]> = {
  en: ["The Ancient World", "The Islamic Golden Age and the Middle Ages", "Renaissance and the Scientific Revolution", "The Enlightenment", "The Nineteenth Century", "The Age of Modern Physics", "The Information Age", "Today"],
  tr: ["Antik Dünya", "İslam Altın Çağı ve Orta Çağ", "Rönesans ve Bilimsel Devrim", "Aydınlanma", "19. Yüzyıl", "Modern Fizik Çağı", "Bilgi Çağı", "Bugün"],
  ru: ["Древний мир", "Золотой век ислама и Средневековье", "Возрождение и научная революция", "Просвещение", "XIX век", "Эпоха современной физики", "Информационная эпоха", "Сегодня"],
  ky: ["Байыркы дүйнө", "Ислам алтын доору жана Орто кылымдар", "Кайра жаралуу жана илимий революция", "Агартуу доору", "XIX кылым", "Заманбап физика доору", "Маалымат доору", "Бүгүн"],
};
const ERA_SLUGS = ["ancient", "golden-age", "revolution", "enlightenment", "industrial", "modern", "information", "today"];
const ERA_BOUNDS: Array<[number, number | null]> = [[-700, 500], [500, 1400], [1400, 1700], [1700, 1800], [1800, 1900], [1900, 1945], [1945, 2000], [2000, null]];

export function fixtureTimeline(locale: Locale): TimelineEvent[] {
  return EVENTS.map((e) => ({ ...e, locale_used: "en", is_fallback: locale !== "en" }));
}

export function fixtureEras(locale: Locale): Era[] {
  return ERA_SLUGS.map((slug, i) => ({
    id: i + 1, slug, start_year: ERA_BOUNDS[i][0], end_year: ERA_BOUNDS[i][1], name: ERA_NAMES[locale][i], tagline: null,
  }));
}
