import { connection } from "next/server";

import { requireActiveSubscription } from "@/lib/subscription/access";

export const instant = false;

/** Routes under (member) require an active subscription (admins bypass). */
export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  await requireActiveSubscription();
  return children;
}
