import { describe, expect, it } from "vitest";
import { parseAlert, parseImageCredit, parseInline, uncreditedImages, youtubeId } from "./markdown";

describe("parseAlert", () => {
  it("reads GitHub's alert markers", () => {
    expect(parseAlert("[!NOTE]\nThe sources disagree.")).toEqual({ kind: "note", rest: "The sources disagree." });
    expect(parseAlert("[!theory] Mass is energy.")).toEqual({ kind: "theory", rest: "Mass is energy." });
  });
  it("leaves an unknown kind and ordinary text alone", () => {
    expect(parseAlert("[!SHOUT] hi")).toBeNull();
    expect(parseAlert("A quotation.")).toBeNull();
  });
});

describe("youtubeId", () => {
  it("accepts the shapes a writer might paste", () => {
    for (const url of [
      "https://www.youtube.com/watch?v=aQhbGDwCu-A",
      "https://youtu.be/aQhbGDwCu-A?t=30",
      "https://www.youtube.com/embed/aQhbGDwCu-A",
      "https://m.youtube.com/shorts/aQhbGDwCu-A",
    ]) expect(youtubeId(url)).toBe("aQhbGDwCu-A");
  });
  it("refuses anything else", () => {
    expect(youtubeId("https://vimeo.com/12345")).toBeNull();
    expect(youtubeId("https://www.youtube.com/watch?v=short")).toBeNull();
    expect(youtubeId("javascript:alert(1)")).toBeNull();
    expect(youtubeId("not a url")).toBeNull();
  });
});

describe("parseImageCredit", () => {
  it("splits author, licence and source", () => {
    expect(parseImageCredit("Wikimedia Commons · Public domain · https://commons.wikimedia.org/x")).toEqual({
      credit: "Wikimedia Commons",
      license: "Public domain",
      source: "https://commons.wikimedia.org/x",
    });
  });
  it("takes a bare author, and reads the source wherever it sits", () => {
    expect(parseImageCredit("NASA")).toEqual({ credit: "NASA", license: null, source: null });
    expect(parseImageCredit("https://nasa.gov/x | NASA | Public domain")).toEqual({
      credit: "NASA", license: "Public domain", source: "https://nasa.gov/x",
    });
  });
  it("counts a title that is nothing but a link as no credit", () => {
    expect(parseImageCredit("https://nasa.gov/x")).toBeNull();
    expect(parseImageCredit("")).toBeNull();
    expect(parseImageCredit(null)).toBeNull();
  });
});

describe("uncreditedImages", () => {
  it("names the pictures that carry nothing", () => {
    const body = [
      '![The arc](a.jpg "Wikimedia Commons · Public domain")',
      "![The trench](b.jpg)",
      "![](c.jpg)",
    ].join("\n\n");
    expect(uncreditedImages(body)).toEqual(["The trench", "c.jpg"]);
  });
  it("passes a body with no pictures", () => {
    expect(uncreditedImages("Just words, and a [link](x).")).toEqual([]);
  });
});

describe("parseInline", () => {
  it("handles bold and italic", () => {
    expect(parseInline("a **b** c *d*")).toEqual([
      { type: "text", text: "a " }, { type: "strong", text: "b" }, { type: "text", text: " c " }, { type: "em", text: "d" },
    ]);
  });
  it("leaves stray asterisks alone", () => {
    expect(parseInline("2 * 3")).toEqual([{ type: "text", text: "2 * 3" }]);
  });
});
