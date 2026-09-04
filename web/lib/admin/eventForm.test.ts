import { describe, expect, it } from "vitest";
import { emptyEventForm, emptyNames, readEventForm, validateEventForm, type EventFormValues } from "./eventForm";

function fd(entries: Record<string, string | string[]>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) (Array.isArray(v) ? v : [v]).forEach((x) => f.append(k, x));
  return f;
}

/** A form with just enough in the source language to be valid. */
function base(overrides: Partial<EventFormValues> = {}): EventFormValues {
  const v = emptyEventForm();
  v.year = "-585";
  v.translations.en = { ...v.translations.en, title: "Thales looks for natural causes", summary: "A sentence." };
  v.disciplines = ["astronomy"];
  return { ...v, ...overrides };
}

describe("readEventForm", () => {
  it("reads every field and falls back on bad enum values", () => {
    const v = readEventForm(fd({ year: " -585 ", precision: "nope", status: "published", source_locale: "xx", disciplines: ["physics", "astronomy"] }));
    expect(v.year).toBe("-585");
    expect(v.precision).toBe("exact");
    expect(v.status).toBe("published");
    expect(v.source_locale).toBe("en");
    expect(v.disciplines).toEqual(["physics", "astronomy"]);
    expect(v.id).toBeNull();
  });

  it("reads all four languages", () => {
    const v = readEventForm(fd({ tr_en_title: "Elements", tr_tr_title: "Öğeler", tr_tr_summary: "Bir cümle." }));
    expect(v.translations.en.title).toBe("Elements");
    expect(v.translations.tr).toMatchObject({ title: "Öğeler", summary: "Bir cümle." });
    expect(v.translations.ky.title).toBe("");
  });

  it("keeps repeating rows lined up by position", () => {
    const v = readEventForm(fd({
      source_title: ["Britannica", "MacTutor"],
      source_url: ["https://britannica.com/x", ""],
      source_kind: ["encyclopedia", "article"],
      person_slug: ["", "qadi-zada"],
      person_name_en: ["Ulugh Beg", "Qadi Zada"],
      person_name_tr: ["Uluğ Bey", ""],
      person_role: ["ruler", "teacher"],
      person_birth_year: ["1394", ""],
      person_death_year: ["1449", ""],
      link_slug: ["ptolemy-almagest"],
      link_note: ["Tables it corrected"],
    }));
    expect(v.sources).toEqual([
      { title: "Britannica", url: "https://britannica.com/x", kind: "encyclopedia" },
      { title: "MacTutor", url: "", kind: "article" },
    ]);
    expect(v.people[0]).toMatchObject({ slug: "", role: "ruler", birth_year: "1394" });
    expect(v.people[0].names).toMatchObject({ en: "Ulugh Beg", tr: "Uluğ Bey", ru: "", ky: "" });
    expect(v.people[1].names.tr).toBe("");
    expect(v.builds_on).toEqual([{ slug: "ptolemy-almagest", note: "Tables it corrected" }]);
  });
});

describe("validateEventForm", () => {
  it("accepts a minimal event and derives the slug from the source-language title", () => {
    const { errors, parsed } = validateEventForm(base());
    expect(errors).toEqual({});
    expect(parsed?.slug).toBe("thales-looks-for-natural-causes");
    expect(parsed?.year).toBe(-585);
    expect(parsed?.translations).toHaveLength(1);
    expect(parsed?.translations[0]).toMatchObject({ locale: "en", body: null });
  });

  it("rejects year 0 (ADR-004), a missing year and a non-integer", () => {
    expect(validateEventForm(base({ year: "0" })).errors.year).toBe("yearZero");
    expect(validateEventForm(base({ year: "" })).errors.year).toBe("yearRequired");
    expect(validateEventForm(base({ year: "12.5" })).errors.year).toBe("yearRequired");
  });

  it("checks year_end against year", () => {
    expect(validateEventForm(base({ year_end: "-600" })).errors.year_end).toBe("yearEndBefore");
    expect(validateEventForm(base({ year_end: "0" })).errors.year_end).toBe("yearZero");
    expect(validateEventForm(base({ year_end: "-500" })).parsed?.year_end).toBe(-500);
  });

  it("requires the source language, one discipline and importance in 1..5", () => {
    const v = base({ disciplines: [], importance: "9" });
    v.translations.en = { ...v.translations.en, title: "", summary: "" };
    expect(validateEventForm(v).errors).toMatchObject({
      "en.title": "titleRequired", "en.summary": "summaryRequired",
      disciplines: "disciplineRequired", importance: "importanceRange",
    });
  });

  it("validates an explicit slug", () => {
    expect(validateEventForm(base({ slug: "Bad Slug" })).errors.slug).toBe("slugInvalid");
    expect(validateEventForm(base({ slug: "thales-eclipse" })).parsed?.slug).toBe("thales-eclipse");
  });
});

describe("validateEventForm: languages", () => {
  it("leaves an untouched language alone rather than writing an empty one", () => {
    const { parsed } = validateEventForm(base());
    expect(parsed!.translations.map((t) => t.locale)).toEqual(["en"]);
  });

  it("saves every language that carries text", () => {
    const v = base();
    v.translations.tr = { ...v.translations.tr, title: "Thales doğaya bakar", summary: "Bir cümle." };
    const { errors, parsed } = validateEventForm(v);
    expect(errors).toEqual({});
    expect(parsed!.translations.map((t) => t.locale)).toEqual(["en", "tr"]);
  });

  it("asks for a title and a summary once a language has been started", () => {
    const v = base();
    v.translations.ru = { ...v.translations.ru, body: "Только текст." };
    const { errors } = validateEventForm(v);
    expect(errors).toMatchObject({ "ru.title": "titleRequired", "ru.summary": "summaryRequired" });
  });
});

describe("validateEventForm: place", () => {
  it("accepts an event with no place at all", () => {
    const { errors, parsed } = validateEventForm(base({ place_precision: "unknown" }));
    expect(errors).toEqual({});
    expect(parsed!.lat).toBeNull();
    expect(parsed!.translations[0].place_name).toBeNull();
  });

  it("drops coordinates and a name left over from a place that was set to unknown", () => {
    const v = base({ place_precision: "unknown", lat: "37.5", lng: "27.3" });
    v.translations.en = { ...v.translations.en, place_name: "Miletus" };
    const { parsed } = validateEventForm(v);
    expect(parsed!.lat).toBeNull();
    expect(parsed!.lng).toBeNull();
    expect(parsed!.translations[0].place_name).toBeNull();
  });

  it("requires coordinates and a source-language name once a place is claimed", () => {
    const { errors } = validateEventForm(base({ place_precision: "city" }));
    expect(errors.lat).toBe("latInvalid");
    expect(errors.lng).toBe("lngInvalid");
    expect(errors["en.place_name"]).toBe("placeNameRequired");
  });

  it("lets a translator leave the name empty in a language that is not the source", () => {
    const v = base({ place_precision: "city", lat: "54.3586", lng: "19.6807" });
    v.translations.en = { ...v.translations.en, place_name: "Frombork" };
    v.translations.ky = { ...v.translations.ky, title: "Тале", summary: "Бир сүйлөм." };
    const { errors, parsed } = validateEventForm(v);
    expect(errors).toEqual({});
    expect(parsed!.translations.find((t) => t.locale === "ky")!.place_name).toBeNull();
  });

  it("keeps latitude and longitude inside their own ranges", () => {
    const at = (lat: string, lng: string) => {
      const v = base({ place_precision: "city", lat, lng });
      v.translations.en = { ...v.translations.en, place_name: "Miletus" };
      return validateEventForm(v).errors;
    };
    expect(at("120", "27.2778").lat).toBe("latInvalid");
    expect(at("37.5306", "200").lng).toBe("lngInvalid");
    expect(at("100", "100").lat).toBe("latInvalid");
    expect(at("100", "100").lng).toBeUndefined();
    expect(at("-90", "-180")).toEqual({});
  });
});

describe("validateEventForm: sources, people and links", () => {
  it("drops untouched rows and keeps the rest", () => {
    const v = base({
      sources: [{ title: "Britannica", url: "https://britannica.com/x", kind: "encyclopedia" }, { title: "", url: "", kind: "book" }],
      builds_on: [{ slug: "euclid-elements", note: "" }, { slug: "", note: "" }],
      people: [{ slug: "", role: "", birth_year: "", death_year: "", names: emptyNames() }],
    });
    const { errors, parsed } = validateEventForm(v);
    expect(errors).toEqual({});
    expect(parsed!.sources).toHaveLength(1);
    expect(parsed!.builds_on).toEqual([{ slug: "euclid-elements", note: null }]);
    expect(parsed!.people).toEqual([]);
  });

  it("refuses a source with a link but no title, and a link that is not a URL", () => {
    expect(validateEventForm(base({ sources: [{ title: "", url: "https://x.test", kind: "book" }] })).errors.sources).toBe("sourceTitleRequired");
    expect(validateEventForm(base({ sources: [{ title: "A book", url: "britannica.com", kind: "book" }] })).errors.sources).toBe("sourceUrlInvalid");
  });

  it("names a person from the source language and derives their slug", () => {
    const v = base({ people: [{ slug: "", role: "ruler", birth_year: "1394", death_year: "1449", names: { ...emptyNames(), en: "Ulugh Beg", tr: "Uluğ Bey" } }] });
    const { errors, parsed } = validateEventForm(v);
    expect(errors).toEqual({});
    expect(parsed!.people[0]).toMatchObject({ slug: "ulugh-beg", role: "ruler", birth_year: 1394, death_year: 1449 });
    expect(parsed!.people[0].names).toEqual({ en: "Ulugh Beg", tr: "Uluğ Bey" });
  });

  it("refuses a person named only in a translation, a bad year and a repeat", () => {
    const only = base({ people: [{ slug: "", role: "", birth_year: "", death_year: "", names: { ...emptyNames(), tr: "Uluğ Bey" } }] });
    expect(validateEventForm(only).errors.people).toBe("personNameRequired");

    const badYear = base({ people: [{ slug: "", role: "", birth_year: "0", death_year: "", names: { ...emptyNames(), en: "Ulugh Beg" } }] });
    expect(validateEventForm(badYear).errors.people).toBe("personYearInvalid");

    const twice = base({ people: [
      { slug: "", role: "", birth_year: "", death_year: "", names: { ...emptyNames(), en: "Ulugh Beg" } },
      { slug: "ulugh-beg", role: "", birth_year: "", death_year: "", names: { ...emptyNames(), en: "Ulugh Beg again" } },
    ] });
    expect(validateEventForm(twice).errors.people).toBe("personDuplicate");
  });

  it("refuses a link to itself and a repeated link", () => {
    expect(validateEventForm(base({ slug: "thales", builds_on: [{ slug: "thales", note: "" }] })).errors.builds_on).toBe("linkSelf");
    expect(validateEventForm(base({ builds_on: [{ slug: "euclid-elements", note: "" }, { slug: "euclid-elements", note: "b" }] })).errors.builds_on).toBe("linkDuplicate");
  });
});

describe("validateEventForm: picture", () => {
  it("refuses a picture with no credit (mirrors image_needs_credit)", () => {
    expect(validateEventForm(base({ image_path: "principia.jpg" })).errors.image).toBe("imageNeedsCredit");
  });

  it("accepts a fully credited picture and forgets credit left behind by a removed one", () => {
    const ok = validateEventForm(base({ image_path: "principia.jpg", image_credit: "Wikimedia Commons", image_license: "Public domain", image_source_url: "https://commons.wikimedia.org/x" }));
    expect(ok.errors).toEqual({});
    expect(ok.parsed!.image_credit).toBe("Wikimedia Commons");

    const removed = validateEventForm(base({ image_path: "", image_credit: "Wikimedia Commons" }));
    expect(removed.errors).toEqual({});
    expect(removed.parsed!.image_path).toBeNull();
    expect(removed.parsed!.image_credit).toBeNull();
  });
});
