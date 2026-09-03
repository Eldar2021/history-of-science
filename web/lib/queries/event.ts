import { cache } from "react";
import type { Locale } from "@/lib/i18n/formatYear";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { fixtureEventDetail } from "@/lib/fixtures/timeline";
import type { EventDetail } from "./types";

/** One published event with everything the detail view shows; null when missing, draft or deleted (RLS). */
export const getEventDetail = cache(async (slug: string, locale: Locale): Promise<EventDetail | null> => {
  if (!hasSupabaseEnv()) return fixtureEventDetail(slug, locale);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_event_detail", { p_slug: slug, p_locale: locale });
  if (error) throw new Error(`get_event_detail failed: ${error.message}`);
  return (data as EventDetail | null) ?? null;
});
