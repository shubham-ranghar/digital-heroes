import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminMessagesPanel } from "@/components/admin/admin-messages-panel";
import { requireAdmin } from "@/lib/auth/session";
import { listContactMessagesAdmin } from "@/lib/contact/admin-queries";

export const metadata: Metadata = {
  title: "Contact messages",
};

export const instant = false;

export default async function AdminMessagesPage() {
  await connection();
  await requireAdmin();

  let messages: Awaited<ReturnType<typeof listContactMessagesAdmin>> = [];
  try {
    messages = await listContactMessagesAdmin();
  } catch {
    messages = [];
  }

  return <AdminMessagesPanel messages={messages} />;
}
