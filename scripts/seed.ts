/**
 * Local / demo seed. Creates test accounts and a full draw lifecycle so a fresh
 * database shows populated draw, prize, and report screens immediately:
 *
 *   - last month: a PUBLISHED draw with entries and one winner in every
 *     verification state (approved+paid, pending with proof, pending without
 *     proof, rejected)
 *   - this month: a DRAFT draw members can sync entries into right away
 *   - the main subscriber: active subscription, charity choice, five recent
 *     scores (rolling-5 at its limit), and one succeeded INR donation
 *
 * Prize amounts and the draft's jackpot carryover come from the draw engine
 * itself (`computePublishDrawOutcome` → `lib/draw/pools.ts`), using the same
 * fee config as a real publish, so they always agree with the 40/35/25 split.
 *
 * Idempotent: every write is an upsert or keyed lookup. Re-running resets the
 * demo winners' verification/payment states to the values below.
 *
 *   npm run seed            (npx tsx scripts/seed.ts)
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
 * .env.local. Creates the four sample charities if missing (supabase/seed.sql
 * adds the same rows plus events). Only *.test seed accounts and their rows
 * are written; real users, scores and draws are left alone.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { crc32, deflateSync } from "node:zlib";

import type { PrizeTier } from "@/lib/draw/constants";
import {
  filterDrawEntriesToActiveSubscribers,
  getDrawFeeConfig,
  loadActiveSubscriberScores,
  loadDrawEntries,
} from "@/lib/draw/db";
import { computePublishDrawOutcome } from "@/lib/draw/publish-outcome";
import {
  currentDrawMonthIso,
  syncUserDrawEntry,
} from "@/lib/draw/sync-entry";
import { WINNER_PROOFS_BUCKET } from "@/lib/winners/constants";

export const SEED_ADMIN_EMAIL = "admin@digital-heroes.test";
export const SEED_ADMIN_PASSWORD = "TestAdmin!digital25";
export const SEED_SUBSCRIBER_EMAIL = "subscriber@digital-heroes.test";
export const SEED_SUBSCRIBER_PASSWORD = "TestMember!digital25";
export const SEED_NOSUB_EMAIL = "nosub@digital-heroes.test";
export const SEED_NOSUB_PASSWORD = "TestNoSub!digital25";

/** Shared password for the demo winners below (they exist to fill admin queues). */
export const SEED_DEMO_WINNER_PASSWORD = "TestWinner!digital25";

/** Last month's winning numbers. Each snapshot below is built to hit one tier. */
const PUBLISHED_WINNING_NUMBERS = [8, 17, 24, 31, 39];

type WinnerState = {
  verification: "pending" | "approved" | "rejected";
  payment: "pending" | "paid";
  withProof: boolean;
};

type DemoPlayer = {
  key: string;
  email: string;
  password: string;
  displayName: string;
  charitySlug: string;
  /** Score snapshot entered into last month's draw. */
  snapshot: number[];
  expectedTier: PrizeTier;
  state: WinnerState;
};

const DEMO_PLAYERS: DemoPlayer[] = [
  {
    key: "subscriber",
    email: SEED_SUBSCRIBER_EMAIL,
    password: SEED_SUBSCRIBER_PASSWORD,
    displayName: "Test Subscriber",
    charitySlug: "sample-riverside-youth",
    snapshot: [39, 31, 24, 17, 8], // 5 matches
    expectedTier: 5,
    state: { verification: "approved", payment: "paid", withProof: true },
  },
  {
    key: "pending-proof",
    email: "winner.pending@digital-heroes.test",
    password: SEED_DEMO_WINNER_PASSWORD,
    displayName: "Demo Winner (proof to review)",
    charitySlug: "sample-greenfield-food-bank",
    snapshot: [8, 17, 24, 31, 12], // 4 matches
    expectedTier: 4,
    state: { verification: "pending", payment: "pending", withProof: true },
  },
  {
    key: "no-proof",
    email: "winner.noproof@digital-heroes.test",
    password: SEED_DEMO_WINNER_PASSWORD,
    displayName: "Demo Winner (awaiting proof)",
    charitySlug: "sample-harbour-mental-health",
    snapshot: [8, 17, 24, 5, 13], // 3 matches
    expectedTier: 3,
    state: { verification: "pending", payment: "pending", withProof: false },
  },
  {
    key: "rejected",
    email: "winner.rejected@digital-heroes.test",
    password: SEED_DEMO_WINNER_PASSWORD,
    displayName: "Demo Winner (proof rejected)",
    charitySlug: "sample-hillside-literacy",
    snapshot: [17, 24, 31, 2, 44], // 3 matches
    expectedTier: 3,
    state: { verification: "rejected", payment: "pending", withProof: true },
  },
];

/** Main subscriber's live scores: five rounds, a week apart, newest first. */
const SUBSCRIBER_SCORES = [
  { daysAgo: 3, score: 36 },
  { daysAgo: 10, score: 31 },
  { daysAgo: 17, score: 28 },
  { daysAgo: 24, score: 34 },
  { daysAgo: 31, score: 25 },
];

/** One succeeded one-off donation, in paise (₹500). */
const SEED_DONATION = {
  paymentIntentId: "seed_demo_donation_1",
  amountPaise: 50_000,
  charitySlug: "sample-riverside-youth",
};

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

function check<T>(result: { data: T; error: { message: string } | null }, what: string): T {
  if (result.error) {
    throw new Error(`${what}: ${result.error.message}`);
  }
  return result.data;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return isoDate(date);
}

/** First day of the UTC month before `monthIso` (same keying as currentDrawMonthIso). */
function previousMonthIso(monthIso: string): string {
  const [year, month] = monthIso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 2, 1));
  return isoDate(date);
}

async function ensureUser(
  admin: SupabaseClient,
  email: string,
  password: string,
  role: "admin" | "subscriber",
  displayName: string,
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
    check(
      await admin
        .from("subscriptions")
        .update({
          status: "active",
          plan: "monthly",
          renewal_date: "2099-12-31",
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id),
      "update subscription",
    );
    return;
  }

  check(
    await admin.from("subscriptions").insert({
      user_id: userId,
      plan: "monthly",
      status: "active",
      renewal_date: "2099-12-31",
    }),
    "insert subscription",
  );
}

/**
 * Sample charities (mirrors supabase/seed.sql). Inserted only when the slug is
 * missing, so admin edits to existing rows are never overwritten.
 */
const SAMPLE_CHARITIES = [
  {
    name: "Riverside Youth Sports",
    slug: "sample-riverside-youth",
    images: ["/charities/youth-sports.webp"],
    description: "After-school coaching and kit for teens in Mumbai.",
    is_featured: true,
  },
  {
    name: "Greenfield Food Bank",
    slug: "sample-greenfield-food-bank",
    images: ["/charities/community-kitchen.webp"],
    description: "Weekly groceries and dignity packs for families in crisis.",
    is_featured: true,
  },
  {
    name: "Harbour Mental Health",
    slug: "sample-harbour-mental-health",
    images: ["/charities/community-health.webp"],
    description: "Counselling and clinic hours funded for coastal communities in Kerala.",
    is_featured: false,
  },
  {
    name: "Hillside Literacy Trust",
    slug: "sample-hillside-literacy",
    images: ["/charities/literacy.webp"],
    description: "Reading mentors and library hours for primary pupils.",
    is_featured: false,
  },
];

async function ensureSampleCharities(admin: SupabaseClient) {
  check(
    await admin.from("charities").upsert(
      SAMPLE_CHARITIES,
      { onConflict: "slug", ignoreDuplicates: true },
    ),
    "insert sample charities",
  );
}

async function loadCharityIds(admin: SupabaseClient) {
  const slugs = Array.from(
    new Set([
      ...DEMO_PLAYERS.map((player) => player.charitySlug),
      SEED_DONATION.charitySlug,
    ]),
  );
  const rows = check(
    await admin.from("charities").select("id, slug").in("slug", slugs),
    "load charities",
  );
  const bySlug = new Map((rows ?? []).map((row) => [row.slug as string, row.id as string]));
  const missing = slugs.filter((slug) => !bySlug.has(slug));
  if (missing.length > 0) {
    throw new Error(
      `Sample charities missing (${missing.join(", ")}) after insert.`,
    );
  }
  return bySlug;
}

async function ensureCharityChoice(
  admin: SupabaseClient,
  userId: string,
  charityId: string,
) {
  check(
    await admin.from("user_charity").upsert(
      {
        user_id: userId,
        charity_id: charityId,
        percentage: 15,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    ),
    "upsert user_charity",
  );
}

async function ensureSubscriberScores(admin: SupabaseClient, userId: string) {
  // Dates are relative to today, so a later re-run produces new dates. Reset
  // this seed account's scores first: otherwise the latest-five trigger
  // (DH001) rejects the older dates and the whole batch fails. Only the
  // seed subscriber is touched.
  check(
    await admin.from("scores").delete().eq("user_id", userId),
    "reset seed scores",
  );
  check(
    await admin.from("scores").insert(
      SUBSCRIBER_SCORES.map(({ daysAgo, score }) => ({
        user_id: userId,
        score,
        played_on: daysAgoIso(daysAgo),
      })),
    ),
    "insert scores",
  );
}

async function ensureDonation(
  admin: SupabaseClient,
  userId: string,
  charityId: string,
) {
  const existing = check(
    await admin
      .from("donations")
      .select("id")
      .eq("payment_intent_id", SEED_DONATION.paymentIntentId)
      .maybeSingle(),
    "find seed donation",
  );
  if (existing?.id) {
    return;
  }
  check(
    await admin.from("donations").insert({
      user_id: userId,
      charity_id: charityId,
      amount_cents: SEED_DONATION.amountPaise,
      currency: "inr",
      status: "succeeded",
      payment_intent_id: SEED_DONATION.paymentIntentId,
    }),
    "insert seed donation",
  );
}

/** Upsert a draw by month and return its id. */
async function upsertDraw(
  admin: SupabaseClient,
  row: {
    month: string;
    status: "draft" | "simulated" | "published";
    mode: "random";
    winning_numbers: number[] | null;
    jackpot_carryover: number;
  },
): Promise<string> {
  const data = check(
    await admin
      .from("draws")
      .upsert(
        { ...row, updated_at: new Date().toISOString() },
        { onConflict: "month" },
      )
      .select("id")
      .single(),
    `upsert draw ${row.month}`,
  );
  if (!data) {
    throw new Error(`upsert draw ${row.month}: no row returned`);
  }
  return data.id as string;
}

/** Plain PNG (solid sand fill with a navy border) standing in for a screenshot. */
function placeholderProofPng(width = 480, height = 270): Buffer {
  const sand = [0xf1, 0xe9, 0xdb];
  const navy = [0x14, 0x21, 0x3d];
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 3 + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const border = x < 8 || y < 8 || x >= width - 8 || y >= height - 8;
      const [r, g, b] = border ? navy : sand;
      const offset = rowStart + 1 + x * 3;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }

  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData));
    return Buffer.concat([length, typeAndData, crc]);
  };

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // truecolour RGB

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * Same `{user_id}/{winner_id}/…` layout the upload action uses (storage RLS
 * keys on the first folder), with a fixed filename so re-runs overwrite.
 */
async function uploadProof(
  admin: SupabaseClient,
  userId: string,
  winnerId: string,
  png: Buffer,
): Promise<string> {
  const path = `${userId}/${winnerId}/seed-proof.png`;
  const { error } = await admin.storage
    .from(WINNER_PROOFS_BUCKET)
    .upload(path, png, { contentType: "image/png", upsert: true });
  if (error) {
    throw new Error(`upload proof: ${error.message}`);
  }
  return path;
}

/**
 * True when last month's draw is missing or is one this script made (same
 * winning numbers, only seed players entered). Anything else is real data
 * and must not be overwritten or have its winners pruned.
 */
async function canOwnPublishedDraw(
  admin: SupabaseClient,
  monthIso: string,
  seedUserIds: Set<string>,
): Promise<boolean> {
  const draw = check(
    await admin
      .from("draws")
      .select("id, winning_numbers")
      .eq("month", monthIso)
      .maybeSingle(),
    "find last month's draw",
  );
  if (!draw) {
    return true;
  }
  const sameNumbers =
    JSON.stringify(draw.winning_numbers) ===
    JSON.stringify(PUBLISHED_WINNING_NUMBERS);
  if (!sameNumbers) {
    return false;
  }
  const [entries, winners] = await Promise.all([
    admin.from("draw_entries").select("user_id").eq("draw_id", draw.id),
    admin.from("winners").select("user_id").eq("draw_id", draw.id),
  ]);
  const userIds = [
    ...(check(entries, "load entries") ?? []),
    ...(check(winners, "load winners") ?? []),
  ].map((row) => row.user_id as string);
  return userIds.every((id) => seedUserIds.has(id));
}

async function seedPublishedDraw(
  admin: SupabaseClient,
  monthIso: string,
  playerIds: Map<string, string>,
) {
  if (!(await canOwnPublishedDraw(admin, monthIso, new Set(playerIds.values())))) {
    console.log(
      `A real draw already exists for ${monthIso}; skipping the demo published draw.`,
    );
    return null;
  }

  const drawId = await upsertDraw(admin, {
    month: monthIso,
    status: "published",
    mode: "random",
    winning_numbers: PUBLISHED_WINNING_NUMBERS,
    jackpot_carryover: 0,
  });

  check(
    await admin.from("draw_entries").upsert(
      DEMO_PLAYERS.map((player) => ({
        draw_id: drawId,
        user_id: playerIds.get(player.key),
        score_snapshot: player.snapshot,
      })),
      { onConflict: "draw_id,user_id" },
    ),
    "upsert published draw entries",
  );

  // Same inputs publishDrawAction feeds the engine.
  const rawEntries = await loadDrawEntries(admin, drawId);
  const { activeCount, scores, activeUserIds } =
    await loadActiveSubscriberScores(admin);
  const { feePerSubscriber, poolPercentage } = getDrawFeeConfig();
  const outcome = computePublishDrawOutcome({
    storedWinningNumbers: PUBLISHED_WINNING_NUMBERS,
    entries: filterDrawEntriesToActiveSubscribers(rawEntries, activeUserIds),
    subscriberScores: scores,
    activeSubscribers: activeCount,
    feePerSubscriber,
    poolPercentage,
    carryover: 0,
  });

  if (feePerSubscriber < 100) {
    console.warn(
      `Warning: draw fee is ₹${feePerSubscriber}/subscriber; prize amounts will look trivial. ` +
        "Set DRAW_FEE_PER_SUBSCRIBER_INR=250 in .env.local and re-run.",
    );
  }

  if (outcome.pools.totalPool <= 0) {
    throw new Error(
      `Prize pool is ₹0 (fee ₹${feePerSubscriber}, ${poolPercentage}%, ${activeCount} active), so the engine allocates no winners. ` +
        "Set DRAW_FEE_PER_SUBSCRIBER_INR to a positive amount in .env.local.",
    );
  }

  const allocationByUser = new Map(
    outcome.prizes.allocations.map((allocation) => [allocation.userId, allocation]),
  );
  for (const player of DEMO_PLAYERS) {
    const allocation = allocationByUser.get(playerIds.get(player.key)!);
    if (allocation?.tier !== player.expectedTier) {
      throw new Error(
        `Seed snapshot for ${player.key} should win tier ${player.expectedTier}, engine gave ${allocation?.tier ?? "none"}.`,
      );
    }
  }

  const winnerRows = check(
    await admin
      .from("winners")
      .upsert(
        outcome.prizes.allocations.map((allocation) => {
          const player = DEMO_PLAYERS.find(
            (candidate) => playerIds.get(candidate.key) === allocation.userId,
          )!;
          return {
            draw_id: drawId,
            user_id: allocation.userId,
            tier: allocation.tier,
            prize_amount: allocation.prizeAmount,
            verification: player.state.verification,
            payment: player.state.payment,
            updated_at: new Date().toISOString(),
          };
        }),
        { onConflict: "draw_id,user_id,tier" },
      )
      .select("id, user_id"),
    "upsert winners",
  );

  // Drop winners on this draw that the seed no longer produces.
  const keepIds = (winnerRows ?? []).map((row) => row.id as string);
  check(
    await admin
      .from("winners")
      .delete()
      .eq("draw_id", drawId)
      .not("id", "in", `(${keepIds.join(",")})`),
    "prune stale winners",
  );

  const png = placeholderProofPng();
  for (const row of winnerRows ?? []) {
    const player = DEMO_PLAYERS.find(
      (candidate) => playerIds.get(candidate.key) === row.user_id,
    )!;
    const proofUrl = player.state.withProof
      ? await uploadProof(admin, row.user_id as string, row.id as string, png)
      : null;
    check(
      await admin.from("winners").update({ proof_url: proofUrl }).eq("id", row.id),
      "set proof_url",
    );
  }

  return { drawId, outcome, activeCount, feePerSubscriber, poolPercentage };
}

async function seedCurrentDraft(
  admin: SupabaseClient,
  monthIso: string,
  /** `null` when last month is real data: keep whatever carryover is stored. */
  carryover: number | null,
  subscriberId: string,
) {
  const existing = check(
    await admin
      .from("draws")
      .select("id, status")
      .eq("month", monthIso)
      .maybeSingle(),
    "find current draw",
  );

  // Never roll an admin's in-progress or published draw back to draft.
  if (existing && existing.status !== "draft") {
    console.log(
      `Current month draw is already ${existing.status}; leaving it untouched.`,
    );
    return existing.id as string;
  }

  let drawId: string;
  if (existing && carryover === null) {
    drawId = existing.id as string;
  } else {
    drawId = await upsertDraw(admin, {
      month: monthIso,
      status: "draft",
      mode: "random",
      winning_numbers: null,
      jackpot_carryover: carryover ?? 0,
    });
  }

  // The real sync path members hit when saving a score.
  await syncUserDrawEntry(admin, subscriberId, drawId);
  return drawId;
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

  await ensureSampleCharities(admin);
  const charityIds = await loadCharityIds(admin);

  await ensureUser(admin, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, "admin", "Test Admin");
  await ensureUser(
    admin,
    SEED_NOSUB_EMAIL,
    SEED_NOSUB_PASSWORD,
    "subscriber",
    "Test No Subscription",
  );

  const playerIds = new Map<string, string>();
  for (const player of DEMO_PLAYERS) {
    const userId = await ensureUser(
      admin,
      player.email,
      player.password,
      "subscriber",
      player.displayName,
    );
    playerIds.set(player.key, userId);
    await ensureActiveSubscription(admin, userId);
    await ensureCharityChoice(admin, userId, charityIds.get(player.charitySlug)!);
  }

  const subscriberId = playerIds.get("subscriber")!;
  await ensureSubscriberScores(admin, subscriberId);
  await ensureDonation(
    admin,
    subscriberId,
    charityIds.get(SEED_DONATION.charitySlug)!,
  );

  const currentMonth = currentDrawMonthIso();
  const lastMonth = previousMonthIso(currentMonth);

  const published = await seedPublishedDraw(admin, lastMonth, playerIds);
  // Mirrors publishDrawAction: unclaimed tier-5 pool rolls into next month.
  const carryover = published?.outcome.prizes.nextJackpotCarryover ?? null;
  await seedCurrentDraft(admin, currentMonth, carryover, subscriberId);

  console.log("\nSeed complete.");
  if (published) {
    const { pools, prizes } = published.outcome;
    console.log(
      `  Published draw ${lastMonth}: ${published.activeCount} active × ₹${published.feePerSubscriber} × ${published.poolPercentage}% = ₹${pools.totalPool} ` +
        `(tier 5 ₹${pools.tier5Pool} / tier 4 ₹${pools.tier4Pool} / tier 3 ₹${pools.tier3Pool})`,
    );
    for (const allocation of prizes.allocations) {
      const player = DEMO_PLAYERS.find(
        (candidate) => playerIds.get(candidate.key) === allocation.userId,
      )!;
      console.log(
        `    tier ${allocation.tier} ₹${allocation.prizeAmount} → ${player.email} (${player.state.verification}/${player.state.payment}${player.state.withProof ? ", proof" : ", no proof"})`,
      );
    }
  }
  console.log(
    `  Draft draw ${currentMonth}: jackpot carryover ${carryover === null ? "unchanged" : `₹${carryover}`}`,
  );
  console.log(`\n  Admin:      ${SEED_ADMIN_EMAIL} / ${SEED_ADMIN_PASSWORD}`);
  console.log(`  Subscriber: ${SEED_SUBSCRIBER_EMAIL} / ${SEED_SUBSCRIBER_PASSWORD}`);
  console.log(`  No sub:     ${SEED_NOSUB_EMAIL} / ${SEED_NOSUB_PASSWORD}`);
  console.log(`  Demo winners (password ${SEED_DEMO_WINNER_PASSWORD}):`);
  for (const player of DEMO_PLAYERS.filter((p) => p.key !== "subscriber")) {
    console.log(`    ${player.email}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
