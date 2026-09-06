import { describe, expect, it } from "vitest";
import { hasSupabaseEnv, requireSupabaseEnv } from "./env";

const full = { NEXT_PUBLIC_SUPABASE_URL: "https://db.example", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" };

describe("supabase env", () => {
  it("reads both variables", () => {
    expect(requireSupabaseEnv(full)).toEqual({ url: "https://db.example", anonKey: "anon" });
    expect(hasSupabaseEnv(full)).toBe(true);
  });

  it("names the variable that is missing", () => {
    expect(() => requireSupabaseEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://db.example" })).toThrow(/ANON_KEY missing/);
    expect(() => requireSupabaseEnv({ NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" })).toThrow(/SUPABASE_URL missing/);
    expect(() => requireSupabaseEnv({})).toThrow(/URL and NEXT_PUBLIC_SUPABASE_ANON_KEY missing/);
  });

  it("treats an empty string as missing, because a blank variable is set in name only", () => {
    expect(hasSupabaseEnv({ ...full, NEXT_PUBLIC_SUPABASE_ANON_KEY: "" })).toBe(false);
    expect(() => requireSupabaseEnv({ ...full, NEXT_PUBLIC_SUPABASE_ANON_KEY: "" })).toThrow();
  });
});
