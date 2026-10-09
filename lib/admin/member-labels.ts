import type { SupabaseClient } from "@supabase/supabase-js";

import type { DrawSimulationPreview } from "@/lib/draw/admin-actions";

export type MemberLabel = { displayName: string | null; email: string | null };

/**
 * Display name and email per user id, via `admin_member_labels` (service
 * role: emails live in auth.users).
 */
export async function loadMemberLabels(
  client: SupabaseClient,
  userIds: string[],
): Promise<Map<string, MemberLabel>> {
  const labels = new Map<string, MemberLabel>();
  const ids = Array.from(new Set(userIds));
  if (ids.length === 0) {
    return labels;
  }

  const { data, error } = await client.rpc("admin_member_labels", {
    p_user_ids: ids,
  });
  if (error) {
    throw new Error(error.message);
  }

  for (const row of (data ?? []) as Record<string, unknown>[]) {
    labels.set(String(row.id), {
      displayName: row.display_name ? String(row.display_name) : null,
      email: row.email ? String(row.email) : null,
    });
  }
  return labels;
}

/**
 * Adds each preview winner's name and email so admins see who won. Display
 * only: if the lookup fails the preview is returned as-is (ids shown), since
 * the simulation it describes has already been saved.
 */
export async function withMemberLabels(
  client: SupabaseClient,
  preview: DrawSimulationPreview,
): Promise<DrawSimulationPreview> {
  let labels: Map<string, MemberLabel>;
  try {
    labels = await loadMemberLabels(
      client,
      preview.winners.map((winner) => winner.userId),
    );
  } catch (error) {
    console.error("Could not load winner names for draw preview:", error);
    return preview;
  }
  return {
    ...preview,
    winners: preview.winners.map((winner) => ({
      ...winner,
      memberName: labels.get(winner.userId)?.displayName ?? null,
      memberEmail: labels.get(winner.userId)?.email ?? null,
    })),
  };
}
