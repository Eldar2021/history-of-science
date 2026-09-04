import { describe, expect, it } from "vitest";
import { imageUrl } from "./media";

describe("imageUrl", () => {
  it("passes a full address through untouched", () => {
    expect(imageUrl("https://upload.wikimedia.org/a.png")).toBe("https://upload.wikimedia.org/a.png");
    expect(imageUrl("HTTP://example.test/a.png")).toBe("HTTP://example.test/a.png");
  });
  it("resolves a bucket path against the Supabase URL, leading slash or not", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://db.test";
    expect(imageUrl("principia.jpg")).toBe("https://db.test/storage/v1/object/public/images/principia.jpg");
    expect(imageUrl("/principia.jpg")).toBe("https://db.test/storage/v1/object/public/images/principia.jpg");
  });
});
