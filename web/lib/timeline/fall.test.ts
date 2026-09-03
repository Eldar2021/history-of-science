import { describe, expect, it } from "vitest";
import { easeOut, parseDuration } from "./fall";

describe("easeOut", () => {
  it("starts at 0, ends at 1, and is fast early", () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(0.5)).toBeGreaterThan(0.8);
  });
  it("clamps outside [0, 1]", () => {
    expect(easeOut(-1)).toBe(0);
    expect(easeOut(2)).toBe(1);
  });
});

describe("parseDuration", () => {
  it("reads ms and s", () => {
    expect(parseDuration("1500ms", 0)).toBe(1500);
    expect(parseDuration("1.5s", 0)).toBe(1500);
    expect(parseDuration(" 250ms ", 0)).toBe(250);
  });
  it("falls back on garbage", () => {
    expect(parseDuration("", 1500)).toBe(1500);
    expect(parseDuration("fast", 1500)).toBe(1500);
  });
});
