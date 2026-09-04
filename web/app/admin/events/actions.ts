"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { TIMELINE_TAG, eventTag } from "@/lib/cache-tags";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { readEventForm, validateEventForm, type EventFormErrors, type EventFormValues, type ParsedEvent } from "@/lib/admin/eventForm";

export type SaveState = { values: EventFormValues; errors: EventFormErrors; version: number };

const UNIQUE_VIOLATION = "23505";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** builds_on is stored by id; the form speaks slugs. Resolved before any write, so an unknown slug costs nothing. */
async function resolveLinks(supabase: Supabase, parsed: ParsedEvent): Promise<Map<string, string> | null> {
  const slugs = parsed.builds_on.map((l) => l.slug);
  if (!slugs.length) return new Map();
  const { data, error } = await supabase.from("events").select("id, slug").in("slug", slugs);
  if (error) return null;
  const byslug = new Map((data ?? []).map((e) => [e.slug, e.id]));
  return slugs.every((s) => byslug.has(s)) ? byslug : null;
}

/** Every person named on the event: created if new, updated if known, named in each language given. */
async function savePeople(supabase: Supabase, eventId: string, parsed: ParsedEvent): Promise<boolean> {
  const { error: unlink } = await supabase.from("event_people").delete().eq("event_id", eventId);
  if (unlink) return false;
  if (!parsed.people.length) return true;

  const { data: rows, error } = await supabase
    .from("people")
    .upsert(parsed.people.map((p) => ({ slug: p.slug, birth_year: p.birth_year, death_year: p.death_year })), { onConflict: "slug" })
    .select("id, slug");
  if (error || !rows) return false;
  const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));

  const names = parsed.people.flatMap((p) =>
    Object.entries(p.names).map(([locale, name]) => ({ person_id: idBySlug.get(p.slug)!, locale: locale as "en", name, status: "human" as const })));
  if (names.length) {
    const { error: nameError } = await supabase.from("person_translations").upsert(names, { onConflict: "person_id,locale" });
    if (nameError) return false;
  }

  const { error: linkError } = await supabase
    .from("event_people")
    .insert(parsed.people.map((p) => ({ event_id: eventId, person_id: idBySlug.get(p.slug)!, role: p.role })));
  return !linkError;
}

/**
 * Create or update one event: the row, every language that carries text, disciplines, sources,
 * people and the builds_on links, in that order.
 *
 * Human action: this is the only code path allowed to write status='published' (CLAUDE.md).
 * It is not a transaction - Supabase's REST client has no way to open one - so a failure halfway
 * leaves the earlier writes standing. Saving again from the same form repairs it.
 */
export async function saveEvent(prev: SaveState, formData: FormData): Promise<SaveState> {
  const staff = await requireStaff();
  const stay = formData.get("stay") === "1";
  const values = readEventForm(formData);
  const { errors, parsed } = validateEventForm(values);
  const bump = (e: EventFormErrors): SaveState => ({ values, errors: e, version: prev.version + 1 });
  if (!parsed) return bump(errors);

  const supabase = await createClient();
  const fail = (key: string) => bump({ form: key });

  const linkIds = await resolveLinks(supabase, parsed);
  if (!linkIds) return bump({ builds_on: "linkUnknown" });

  const eventFields = {
    slug: parsed.slug,
    year: parsed.year,
    year_end: parsed.year_end,
    precision: parsed.precision,
    importance: parsed.importance,
    lat: parsed.lat,
    lng: parsed.lng,
    place_precision: parsed.place_precision,
    image_path: parsed.image_path,
    image_credit: parsed.image_credit,
    image_license: parsed.image_license,
    image_source_url: parsed.image_source_url,
    status: parsed.status,
    source_locale: parsed.source_locale,
  };

  let id = parsed.id;
  let previousSlug: string | null = null;
  if (id) {
    const { data: before } = await supabase.from("events").select("slug").eq("id", id).maybeSingle();
    previousSlug = before?.slug ?? null;
    const { error } = await supabase.from("events").update(eventFields).eq("id", id);
    if (error) return error.code === UNIQUE_VIOLATION ? bump({ slug: "slugTaken" }) : fail("saveFailed");
  } else {
    const { data, error } = await supabase
      .from("events")
      .insert({ ...eventFields, drafted_by: "human", created_by: staff.id })
      .select("id")
      .single();
    if (error || !data) return error?.code === UNIQUE_VIOLATION ? bump({ slug: "slugTaken" }) : fail("saveFailed");
    id = data.id;
  }

  const { error: trError } = await supabase
    .from("event_translations")
    .upsert(parsed.translations.map((t) => ({ event_id: id, status: "human" as const, ...t })), { onConflict: "event_id,locale" });
  if (trError) return fail("saveFailed");

  const { data: disciplineRows, error: dError } = await supabase.from("disciplines").select("id, slug").in("slug", parsed.disciplines);
  if (dError) return fail("saveFailed");
  const { error: delError } = await supabase.from("event_disciplines").delete().eq("event_id", id);
  if (delError) return fail("saveFailed");
  const { error: insError } = await supabase
    .from("event_disciplines")
    .insert((disciplineRows ?? []).map((d, i) => ({ event_id: id, discipline_id: d.id, is_primary: i === 0 })));
  if (insError) return fail("saveFailed");

  const { error: srcDelError } = await supabase.from("sources").delete().eq("event_id", id);
  if (srcDelError) return fail("saveFailed");
  if (parsed.sources.length) {
    const { error } = await supabase.from("sources").insert(parsed.sources.map((s) => ({ event_id: id, ...s })));
    if (error) return fail("saveFailed");
  }

  if (!(await savePeople(supabase, id!, parsed))) return fail("saveFailed");

  const { error: linkDelError } = await supabase.from("event_links").delete().eq("from_event_id", id).eq("type", "builds_on");
  if (linkDelError) return fail("saveFailed");
  if (parsed.builds_on.length) {
    const { error } = await supabase.from("event_links").insert(
      parsed.builds_on.map((l) => ({ from_event_id: id!, to_event_id: linkIds.get(l.slug)!, type: "builds_on" as const, note: l.note })));
    if (error) return fail("saveFailed");
  }

  // doc/mimari.md: save → tags expire → the next visitor gets the fresh page. updateTag expires immediately.
  updateTag(TIMELINE_TAG);
  updateTag(eventTag(parsed.slug));
  if (previousSlug && previousSlug !== parsed.slug) updateTag(eventTag(previousSlug));
  // The admin's own pages are dynamic, but the client router keeps a copy of the list it came from.
  revalidatePath("/admin/events");
  revalidatePath("/admin");

  redirect(stay ? `/admin/events/${id}?saved=1&locale=${parsed.edit_locale}` : `/admin/events?saved=1`);
}

/** Soft delete, always reversible. The row stays; RLS hides it from visitors through deleted_at. */
export async function deleteEvent(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/events");
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").update({ deleted_at: new Date().toISOString() }).eq("id", id).select("slug").maybeSingle();
  if (error) redirect(`/admin/events/${id}?error=saveFailed`);
  updateTag(TIMELINE_TAG);
  if (data) updateTag(eventTag(data.slug));
  revalidatePath("/admin/events");
  revalidatePath("/admin");
  redirect("/admin/events?deleted=1");
}

export async function restoreEvent(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/events");
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").update({ deleted_at: null }).eq("id", id).select("slug").maybeSingle();
  if (error) redirect(`/admin/events/${id}?error=saveFailed`);
  updateTag(TIMELINE_TAG);
  if (data) updateTag(eventTag(data.slug));
  revalidatePath("/admin/events");
  revalidatePath("/admin");
  redirect("/admin/events?restored=1");
}
