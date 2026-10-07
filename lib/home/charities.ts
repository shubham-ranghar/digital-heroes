import type { SupabaseClient } from "@supabase/supabase-js";

import { listCharities, listUpcomingCharityEvents } from "@/lib/charity/queries";
import type { Charity, CharityEvent } from "@/lib/charity/types";

export type HomepageCharities = {
  featured: Charity | null;
  others: Charity[];
  featuredEvents: CharityEvent[];
};

export async function getHomepageCharities(
  supabase: SupabaseClient,
): Promise<HomepageCharities> {
  const all = await listCharities(supabase);
  if (all.length === 0) {
    return { featured: null, others: [], featuredEvents: [] };
  }

  const featured = all.find((charity) => charity.is_featured) ?? all[0];
  const others = all.filter((charity) => charity.id !== featured.id).slice(0, 3);
  const featuredEvents = featured
    ? await listUpcomingCharityEvents(supabase, featured.id)
    : [];

  return { featured, others, featuredEvents };
}
