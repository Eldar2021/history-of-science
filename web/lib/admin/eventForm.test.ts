import { describe, expect, it } from "vitest";
import { emptyEventForm, readEventForm, validateEventForm } from "./eventForm";

function fd(entries: Record<string, string | string[]>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) (Array.isArray(v) ? v : [v]).forEach((x) => f.append(k, x));
  return f;
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
});

describe("validateEventForm", () => {
  const good = { ...emptyEventForm(), year: "-585", title: "Thales predicts an eclipse", summary: "A sentence.", disciplines: ["astronomy"] };

  it("accepts a minimal event and derives the slug from the title", () => {
    const { errors, parsed } = validateEventForm(good);
    expect(errors).toEqual({});
    expect(parsed?.slug).toBe("thales-predicts-an-eclipse");
    expect(parsed?.year).toBe(-585);
    expect(parsed?.year_end).toBeNull();
    expect(parsed?.translation.body).toBeNull();
  });
  it("rejects year 0 (ADR-004), a missing year and a non-integer", () => {
    expect(validateEventForm({ ...good, year: "0" }).errors.year).toBe("yearZero");
    expect(validateEventForm({ ...good, year: "" }).errors.year).toBe("yearRequired");
    expect(validateEventForm({ ...good, year: "12.5" }).errors.year).toBe("yearRequired");
  });
  it("checks year_end against year", () => {
    expect(validateEventForm({ ...good, year_end: "-600" }).errors.year_end).toBe("yearEndBefore");
    expect(validateEventForm({ ...good, year_end: "0" }).errors.year_end).toBe("yearZero");
    expect(validateEventForm({ ...good, year_end: "-500" }).parsed?.year_end).toBe(-500);
  });
  it("requires title, summary and one discipline; importance in 1..5", () => {
    const { errors } = validateEventForm({ ...good, title: "", summary: "", disciplines: [], importance: "9" });
    expect(errors).toMatchObject({ title: "titleRequired", summary: "summaryRequired", disciplines: "disciplineRequired", importance: "importanceRange" });
  });
  it("validates an explicit slug", () => {
    expect(validateEventForm({ ...good, slug: "Bad Slug" }).errors.slug).toBe("slugInvalid");
    expect(validateEventForm({ ...good, slug: "thales-eclipse" }).parsed?.slug).toBe("thales-eclipse");
  });
});

describe("validateEventForm: place", () => {
  const good = { ...emptyEventForm(), year: "-585", title: "Thales looks for natural causes", summary: "A sentence.", disciplines: ["astronomy"] };

  it("accepts an event with no place at all", () => {
    const { errors, parsed } = validateEventForm({ ...good, place_precision: "unknown" });
    expect(errors).toEqual({});
    expect(parsed!.lat).toBeNull();
    expect(parsed!.lng).toBeNull();
    expect(parsed!.translation.place_name).toBeNull();
  });

  it("drops coordinates and name left over from a place that was set to unknown", () => {
    // The form hides the fields, but a stale POST must not slip past place_needs_coords.
    const { parsed } = validateEventForm({ ...good, place_precision: "unknown", lat: "37.5", lng: "27.3", place_name: "Miletus" });
    expect(parsed!.lat).toBeNull();
    expect(parsed!.lng).toBeNull();
    expect(parsed!.translation.place_name).toBeNull();
  });

  it("requires coordinates and a name once a place is claimed", () => {
    const { errors } = validateEventForm({ ...good, place_precision: "city" });
    expect(errors.lat).toBe("latInvalid");
    expect(errors.lng).toBe("lngInvalid");
    expect(errors.place_name).toBe("placeNameRequired");
  });

  it("lets a translator leave the name empty in a language that is not the source", () => {
    const { errors, parsed } = validateEventForm({
      ...good, place_precision: "city", lat: "54.3586", lng: "19.6807",
      source_locale: "en", edit_locale: "ky", place_name: "",
    });
    expect(errors).toEqual({});
    expect(parsed!.translation.place_name).toBeNull(); // reads fall back to the source locale
  });

  it("keeps latitude and longitude inside their own ranges", () => {
    const at = (lat: string, lng: string) => validateEventForm({ ...good, place_precision: "city", place_name: "Miletus", lat, lng }).errors;
    expect(at("120", "27.2778").lat).toBe("latInvalid");
    expect(at("37.5306", "200").lng).toBe("lngInvalid");
    // 100 is a valid longitude but not a valid latitude
    expect(at("100", "100").lat).toBe("latInvalid");
    expect(at("100", "100").lng).toBeUndefined();
    expect(at("-90", "-180")).toEqual({});
  });

  it("passes a real place through unchanged", () => {
    const { errors, parsed } = validateEventForm({ ...good, place_precision: "exact", place_name: "Samarkand", lat: "39.6753", lng: "67.0053" });
    expect(errors).toEqual({});
    expect(parsed!.lat).toBe(39.6753);
    expect(parsed!.lng).toBe(67.0053);
    expect(parsed!.place_precision).toBe("exact");
    expect(parsed!.translation.place_name).toBe("Samarkand");
  });
});
