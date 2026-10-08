import type { SupabaseClient } from "@supabase/supabase-js";

import {
  parseCharityImages,
  type Charity,
  type CharityEvent,
} from "@/lib/charity/types";
import { todayIsoDate } from "@/lib/scores/dates";

function mapCharity(row: Record<string, unknown>): Charity {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: row.description ? String(row.description) : null,
    images: parseCharityImages(row.images),
    category: row.category ? String(row.category) : null,
    is_featured: Boolean(row.is_featured),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function listCharities(
  supabase: SupabaseClient,
): Promise<Charity[]> {
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapCharity(row as Record<string, unknown>));
}

export async function getFeaturedCharity(
  supabase: SupabaseClient,
): Promise<Charity | null> {
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .eq("is_featured", true)
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapCharity(data as Record<string, unknown>) : null;
}

export async function getCharityBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<Charity | null> {
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapCharity(data as Record<string, unknown>) : null;
}

export async function listUpcomingCharityEvents(
  supabase: SupabaseClient,
  charityId: string,
): Promise<CharityEvent[]> {
  const today = todayIsoDate();
  const { data, error } = await supabase
    .from("charity_events")
    .select("*")
    .eq("charity_id", charityId)
    .gte("event_date", today)
    .order("event_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CharityEvent[];
}
