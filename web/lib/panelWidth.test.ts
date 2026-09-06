import { describe, expect, it } from "vitest";
import { PANEL_DEFAULT_PX, PANEL_MAX_PX, PANEL_MIN_PX, clampPanelWidth, maxPanelWidth, parsePanelWidth } from "./panelWidth";

describe("maxPanelWidth", () => {
  it("stops at the reading measure on a wide screen", () => {
    expect(maxPanelWidth(2560)).toBe(PANEL_MAX_PX);
  });

  it("leaves a tenth of a narrow window to the timeline behind", () => {
    expect(maxPanelWidth(900)).toBe(810);
  });

  it("never falls under the minimum, even on a window narrower than the panel", () => {
    expect(maxPanelWidth(320)).toBe(PANEL_MIN_PX);
  });
});

describe("clampPanelWidth", () => {
  it("keeps a width that fits", () => {
    expect(clampPanelWidth(640, 1440)).toBe(640);
  });

  it("pulls a dragged edge back inside both bounds", () => {
    expect(clampPanelWidth(2000, 1440)).toBe(PANEL_MAX_PX);
    expect(clampPanelWidth(40, 1440)).toBe(PANEL_MIN_PX);
  });

  it("rounds, so the width never lands on a fractional pixel", () => {
    expect(clampPanelWidth(640.6, 1440)).toBe(641);
  });
});

describe("parsePanelWidth", () => {
  it("reads a remembered width", () => {
    expect(parsePanelWidth("640", 1440)).toBe(640);
  });

  it("shrinks a width remembered on a bigger screen", () => {
    expect(parsePanelWidth("880", 900)).toBe(810);
  });

  it("ignores anything that is not a width", () => {
    for (const raw of [null, "", " ", "wide", "-100", "0", "NaN"]) expect(parsePanelWidth(raw, 1440)).toBeNull();
  });

  it("has a default inside its own bounds", () => {
    expect(clampPanelWidth(PANEL_DEFAULT_PX, 1440)).toBe(PANEL_DEFAULT_PX);
  });
});
