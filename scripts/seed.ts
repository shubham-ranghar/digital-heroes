/**
 * Local dev seed: one admin, one active subscriber, one member without a subscription row.
 *
 *   npx tsx scripts/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (optional),
 * and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export const SEED_ADMIN_EMAIL = "admin@digital-heroes.test";
export const SEED_ADMIN_PASSWORD = "TestAdmin!digital25";
export const SEED_SUBSCRIBER_EMAIL = "subscriber@digital-heroes.test";
export const SEED_SUBSCRIBER_PASSWORD = "TestMember!digital25";
export const SEED_NOSUB_EMAIL = "nosub@digital-heroes.test";
export const SEED_NOSUB_PASSWORD = "TestNoSub!digital25";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    return;
  }
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function ensureUser(
  admin: SupabaseClient,
  email: string,
  password: string,
  role: "admin" | "subscriber",
) {
  const { data: list, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) {
    throw new Error(listError.message);
  }

  const existing = list.users.find(
    (user) => user.email?.toLowerCase() === email.toLowerCase(),
  );

  let userId = existing?.id;
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw new Error(error?.message ?? "Failed to create user");
    }
    userId = data.user.id;
    console.log(`Created ${role} auth user: ${email}`);
  } else {
    console.log(`Auth user already exists: ${email}`);
  }

  const displayName =
    role === "admin"
      ? "Test Admin"
      : email === SEED_NOSUB_EMAIL
        ? "Test No Subscription"
        : "Test Subscriber";

  // handle_new_user() inserts role=subscriber; upserting admin hits profiles_guard_role.
  if (role === "admin") {
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfile?.role === "admin") {
      const { error: profileError } = await admin
        .from("profiles")
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (profileError) {
        throw new Error(profileError.message);
      }
    } else {
      await admin.from("profiles").delete().eq("id", userId);
      const { error: profileError } = await admin.from("profiles").insert({
        id: userId,
        role: "admin",
        display_name: displayName,
        updated_at: new Date().toISOString(),
      });
      if (profileError) {
        throw new Error(profileError.message);
      }
    }
  } else {
    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        role: "subscriber",
        display_name: displayName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (profileError) {
      throw new Error(profileError.message);
    }
  }

  return userId;
}

async function ensureActiveSubscription(
  admin: SupabaseClient,
  userId: string,
) {
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await admin
      .from("subscriptions")
      .update({
        status: "active",
        plan: "monthly",
        renewal_date: "2099-12-31",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) {
      throw new Error(error.message);
    }
    console.log("Updated subscriber subscription to active.");
    return;
  }

  const { error } = await admin.from("subscriptions").insert({
    user_id: userId,
    plan: "monthly",
    status: "active",
    renewal_date: "2099-12-31",
  });
  if (error) {
    throw new Error(error.message);
  }
  console.log("Inserted active subscription for test subscriber.");
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const adminId = await ensureUser(
    admin,
    SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD,
    "admin",
  );
  const subscriberId = await ensureUser(
    admin,
    SEED_SUBSCRIBER_EMAIL,
    SEED_SUBSCRIBER_PASSWORD,
    "subscriber",
  );
  const nosubId = await ensureUser(
    admin,
    SEED_NOSUB_EMAIL,
    SEED_NOSUB_PASSWORD,
    "subscriber",
  );

  await ensureActiveSubscription(admin, subscriberId);

  console.log("\nSeed complete.");
  console.log(`  Admin:      ${SEED_ADMIN_EMAIL} / ${SEED_ADMIN_PASSWORD}`);
  console.log(
    `  Subscriber: ${SEED_SUBSCRIBER_EMAIL} / ${SEED_SUBSCRIBER_PASSWORD}`,
  );
  console.log(
    `  No sub:     ${SEED_NOSUB_EMAIL} / ${SEED_NOSUB_PASSWORD}`,
  );
  console.log(`  Admin user id: ${adminId}`);
  console.log(`  Subscriber user id: ${subscriberId}`);
  console.log(`  No-sub user id: ${nosubId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
