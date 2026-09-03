"use server";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { readEventForm, validateEventForm, type EventFormErrors, type EventFormValues } from "@/lib/admin/eventForm";

export type SaveState = { values: EventFormValues; errors: EventFormErrors; version: number };

const UNIQUE_VIOLATION = "23505";

/**
 * Create or update one event plus the translation being edited and its disciplines.
 * Human action: this is the only code path allowed to write status='published' (CLAUDE.md).
 */
export async function saveEvent(prev: SaveState, formData: FormData): Promise<SaveState> {
  const staff = await requireStaff();
  const values = readEventForm(formData);
  const { errors, parsed } = validateEventForm(values);
  if (!parsed) return { values, errors, version: prev.version + 1 };

  const supabase = await createClient();
  const fail = (key: string): SaveState => ({ values, errors: { form: key }, version: prev.version + 1 });

  const eventFields = {
    slug: parsed.slug,
    year: parsed.year,
    year_end: parsed.year_end,
    precision: parsed.precision,
    importance: parsed.importance,
    status: parsed.status,
    source_locale: parsed.source_locale,
  };

  let id = parsed.id;
  if (id) {
    const { error } = await supabase.from("events").update(eventFields).eq("id", id);
    if (error) return error.code === UNIQUE_VIOLATION ? { values, errors: { slug: "slugTaken" }, version: prev.version + 1 } : fail("saveFailed");
  } else {
    const { data, error } = await supabase
      .from("events")
      .insert({ ...eventFields, drafted_by: "human", created_by: staff.id })
      .select("id")
      .single();
    if (error || !data) return error?.code === UNIQUE_VIOLATION ? { values, errors: { slug: "slugTaken" }, version: prev.version + 1 } : fail("saveFailed");
    id = data.id;
  }

  const { error: trError } = await supabase
    .from("event_translations")
    .upsert({ event_id: id, locale: parsed.edit_locale, status: "human", ...parsed.translation }, { onConflict: "event_id,locale" });
  if (trError) return fail("saveFailed");

  const { data: disciplineRows, error: dError } = await supabase.from("disciplines").select("id, slug").in("slug", parsed.disciplines);
  if (dError) return fail("saveFailed");
  const { error: delError } = await supabase.from("event_disciplines").delete().eq("event_id", id);
  if (delError) return fail("saveFailed");
  const { error: insError } = await supabase
    .from("event_disciplines")
    .insert((disciplineRows ?? []).map((d, i) => ({ event_id: id, discipline_id: d.id, is_primary: i === 0 })));
  if (insError) return fail("saveFailed");

  redirect(`/admin/events/${id}?saved=1&locale=${parsed.edit_locale}`);
}
