import { createAdminClient } from "@/lib/supabase/admin";

export type AdminContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  resolved: boolean;
  createdAt: string;
};

export async function listContactMessagesAdmin(): Promise<AdminContactMessage[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("contact_messages")
    .select("id, name, email, message, resolved, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    message: String(row.message),
    resolved: Boolean(row.resolved),
    createdAt: String(row.created_at),
  }));
}

export async function countUnreadContactMessages(): Promise<number> {
  try {
    const admin = createAdminClient();
    const { count, error } = await admin
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("resolved", false);

    if (error) {
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}
