import { unstable_cache } from "next/cache";
import type { Locale } from "@/lib/i18n/formatYear";
import { createAnonClient } from "@/lib/supabase/anon";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import { fixtureEventDetail } from "@/lib/fixtures/timeline";
import { FALLBACK_REVALIDATE_SECONDS, TIMELINE_TAG, eventTag } from "@/lib/cache-tags";
import type { EventDetail } from "./types";

const fetchEventDetail = (slug: string, locale: Locale) =>
  unstable_cache(
    async (): Promise<EventDetail | null> => {
      const { data, error } = await createAnonClient().rpc("get_event_detail", { p_slug: slug, p_locale: locale });
      if (error) throw new Error(`get_event_detail failed: ${error.message}`);
      return (data as EventDetail | null) ?? null;
    },
    ["event", slug, locale],
    // TIMELINE_TAG too: a linked event's title or year changes what this document shows.
    { tags: [eventTag(slug), TIMELINE_TAG], revalidate: FALLBACK_REVALIDATE_SECONDS },
  )();

/** One published event with everything the detail view shows; null when missing, draft or deleted (RLS). */
export const getEventDetail = (slug: string, locale: Locale): Promise<EventDetail | null> =>
  hasSupabaseEnv() ? fetchEventDetail(slug, locale) : Promise.resolve(fixtureEventDetail(slug, locale));
