import { describe, expect, it } from "vitest";
import { parseBlocks, parseInline } from "./markdown";

describe("parseBlocks", () => {
  it("splits headings and paragraphs", () => {
    expect(parseBlocks("### The scene\n\nOne.\nStill one.\n\n\nTwo.")).toEqual([
      { type: "heading", text: "The scene" },
      { type: "paragraph", text: "One. Still one." },
      { type: "paragraph", text: "Two." },
    ]);
  });
  it("accepts a heading directly followed by text", () => {
    expect(parseBlocks("## A\nb")).toEqual([{ type: "heading", text: "A" }, { type: "paragraph", text: "b" }]);
  });
  it("ignores blank input", () => {
    expect(parseBlocks("\n\n")).toEqual([]);
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
