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
