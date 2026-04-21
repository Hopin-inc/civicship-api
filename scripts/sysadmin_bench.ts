/**
 * Perf benchmark: weekly retention trend — bulk vs loop.
 *
 * Seeds N members, DONATION transactions across M weeks, then runs
 *   A) the new bulk `findWeeklyRetentionSeries`
 *   B) a hand-rolled loop mirroring the old per-week
 *      `findRetentionAggregate` + `findMonthActivity` pattern
 * ten times each and reports the median.
 *
 * Run with:
 *   DATABASE_URL=postgresql://civicship:civicship@127.0.0.1:5432/civicship_dev \
 *     pnpm tsx scripts/sysadmin_bench.ts
 */
import "reflect-metadata";
import { PrismaClient } from "@prisma/client";
import { isoWeekStartJst, addDays } from "@/application/domain/report/util";

const prisma = new PrismaClient();

const COMMUNITY_ID = "bench_c1";
const MEMBER_COUNT = Number(process.env.MEMBERS ?? 100);
const WINDOW_WEEKS = Number(process.env.WEEKS ?? 43); // ~windowMonths=10
const ASOF = new Date("2026-04-21T00:00:00Z");

/** Deterministic pseudo-random (mulberry32) so runs are reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function seed() {
  console.log("Resetting bench fixtures...");
  // Clear only what we re-create; leave other communities alone.
  await prisma.$executeRawUnsafe(
    `DELETE FROM "t_transactions" WHERE EXISTS (
       SELECT 1 FROM "t_wallets" fw
       WHERE fw."id" = "t_transactions"."from" AND fw."community_id" = $1
     )`,
    COMMUNITY_ID,
  );
  await prisma.$executeRawUnsafe(
    `DELETE FROM "t_wallets" WHERE "community_id" = $1`,
    COMMUNITY_ID,
  );
  await prisma.$executeRawUnsafe(
    `DELETE FROM "t_memberships" WHERE "community_id" = $1`,
    COMMUNITY_ID,
  );
  await prisma.$executeRawUnsafe(
    `DELETE FROM "t_communities" WHERE "id" = $1`,
    COMMUNITY_ID,
  );
  await prisma.$executeRawUnsafe(
    `DELETE FROM "t_users" WHERE "id" LIKE 'bench_u%'`,
  );

  console.log("Creating community, users, memberships, wallets...");
  await prisma.community.create({
    data: {
      id: COMMUNITY_ID,
      name: "Bench Community",
      pointName: "BenchPoint",
    },
  });

  const rand = mulberry32(12345);
  const userIds: string[] = [];
  const walletIds: string[] = [];

  for (let i = 0; i < MEMBER_COUNT; i++) {
    const uid = `bench_u${i}`;
    userIds.push(uid);
    // Joined at a random point in the trailing 12 months so member
    // count at week end varies per week.
    const joinOffset = Math.floor(rand() * 365);
    const createdAt = addDays(ASOF, -joinOffset);
    await prisma.user.create({
      data: {
        id: uid,
        name: `Bench ${i}`,
        slug: `bench-${i}`,
        currentPrefecture: "KAGAWA",
      },
    });
    await prisma.membership.create({
      data: {
        userId: uid,
        communityId: COMMUNITY_ID,
        status: "JOINED",
        reason: "CREATED_COMMUNITY",
        role: "MEMBER",
        createdAt,
      },
    });
    const wallet = await prisma.wallet.create({
      data: {
        communityId: COMMUNITY_ID,
        userId: uid,
      },
    });
    walletIds.push(wallet.id);
  }

  console.log("Creating DONATION transactions across 43 weeks x 100 members...");
  const latestWeek = isoWeekStartJst(ASOF);
  const txRows: Array<{
    from: string;
    to: string;
    createdAt: Date;
  }> = [];

  for (let wk = 0; wk < WINDOW_WEEKS; wk++) {
    const weekStart = addDays(latestWeek, -wk * 7);
    for (let m = 0; m < MEMBER_COUNT; m++) {
      // Each member has a base send-rate; multiply by a per-week
      // perturbation so the retention join sees real churn/return.
      const baseRate = (m % 10) / 10; // 0.0..0.9
      const perturb = rand();
      if (perturb < baseRate) {
        // Pick a random recipient that isn't self.
        let target = Math.floor(rand() * MEMBER_COUNT);
        if (target === m) target = (target + 1) % MEMBER_COUNT;
        const createdAt = addDays(weekStart, Math.floor(rand() * 7));
        txRows.push({
          from: walletIds[m],
          to: walletIds[target],
          createdAt,
        });
      }
    }
  }

  // Batch insert for speed.
  console.log(`  inserting ${txRows.length} transactions...`);
  const chunkSize = 500;
  for (let i = 0; i < txRows.length; i += chunkSize) {
    const chunk = txRows.slice(i, i + chunkSize);
    await prisma.transaction.createMany({
      data: chunk.map((r) => ({
        reason: "DONATION",
        from: r.from,
        fromPointChange: 100,
        to: r.to,
        toPointChange: 100,
        createdAt: r.createdAt,
      })),
    });
  }

  console.log("Refreshing materialized views...");
  await prisma.$executeRawUnsafe(
    `REFRESH MATERIALIZED VIEW "mv_transaction_summary_daily"`,
  );
  await prisma.$executeRawUnsafe(
    `REFRESH MATERIALIZED VIEW "mv_user_transaction_daily"`,
  );
  console.log(`Seed complete: ${MEMBER_COUNT} members, ${txRows.length} DONATIONs.`);
}

function buildWeekStarts(asOf: Date, weeks: number): Date[] {
  const latest = isoWeekStartJst(asOf);
  const first = addDays(latest, -(weeks - 1) * 7);
  const out: Date[] = [];
  for (let wk = first; wk <= latest; wk = addDays(wk, 7)) out.push(wk);
  return out;
}

/** The bulk SQL, inlined so the bench doesn't depend on repo imports. */
async function runBulk(weekStarts: Date[]) {
  const t0 = performance.now();
  await prisma.$queryRawUnsafe(
    `
    WITH target_weeks AS (
      SELECT unnest($1::date[]) AS week_start
    ),
    lookback_bounds AS (
      SELECT
        (MIN(week_start) - INTERVAL '12 weeks')::date AS first_date,
        (MAX(week_start) + INTERVAL '7 days')::date   AS last_date
      FROM target_weeks
    ),
    user_week_flags AS (
      SELECT
        mv."user_id",
        DATE_TRUNC('week', mv."date")::date AS week_start,
        BOOL_OR(mv."donation_out_count" > 0) AS is_sender,
        BOOL_OR(mv."received_donation_count" > 0) AS is_receiver
      FROM "mv_user_transaction_daily" mv
      CROSS JOIN lookback_bounds lb
      WHERE mv."community_id" = $2
        AND mv."date" >= lb.first_date
        AND mv."date" <  lb.last_date
      GROUP BY mv."user_id", DATE_TRUNC('week', mv."date")
    ),
    ever_before AS (
      SELECT DISTINCT
        tw.week_start AS target_week,
        uwf."user_id"
      FROM target_weeks tw
      INNER JOIN user_week_flags uwf
        ON uwf.week_start >= (tw.week_start - INTERVAL '12 weeks')::date
        AND uwf.week_start <  (tw.week_start - INTERVAL '7 days')::date
        AND uwf.is_sender = true
    ),
    per_target AS (
      SELECT
        tw.week_start AS target_week,
        COALESCE(cw."user_id", pw."user_id") AS user_id,
        cw.is_sender AS curr_is_sender,
        cw.is_receiver AS curr_is_receiver,
        pw.is_sender AS prev_is_sender
      FROM target_weeks tw
      LEFT JOIN user_week_flags cw ON cw.week_start = tw.week_start
      FULL OUTER JOIN user_week_flags pw
        ON pw.week_start = (tw.week_start - INTERVAL '7 days')::date
        AND (cw."user_id" IS NULL OR pw."user_id" = cw."user_id")
      WHERE cw."user_id" IS NOT NULL OR pw."user_id" IS NOT NULL
    ),
    retention_counts AS (
      SELECT
        pt.target_week AS week_start,
        COUNT(*) FILTER (WHERE pt.curr_is_sender = true AND pt.prev_is_sender = true)::int AS retained_senders,
        COUNT(*) FILTER (WHERE pt.prev_is_sender = true AND (pt.curr_is_sender IS NULL OR pt.curr_is_sender = false))::int AS churned_senders,
        COUNT(*) FILTER (WHERE pt.curr_is_sender = true AND (pt.prev_is_sender IS NULL OR pt.prev_is_sender = false) AND eb."user_id" IS NOT NULL)::int AS returned_senders,
        COUNT(*) FILTER (WHERE pt.curr_is_sender = true)::int AS current_senders_count,
        COUNT(*) FILTER (WHERE pt.curr_is_sender = true OR pt.curr_is_receiver = true)::int AS current_active_count
      FROM per_target pt
      LEFT JOIN ever_before eb ON eb.target_week = pt.target_week AND eb."user_id" = pt.user_id
      GROUP BY pt.target_week
    ),
    new_members_per_week AS (
      SELECT tw.week_start, COUNT(m."user_id")::int AS new_members
      FROM target_weeks tw
      LEFT JOIN "t_memberships" m
        ON m."community_id" = $2 AND m."status" = 'JOINED'
        AND m."created_at" >= (tw.week_start::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
        AND m."created_at" <  ((tw.week_start + INTERVAL '7 days')::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
      GROUP BY tw.week_start
    ),
    total_members_per_week AS (
      SELECT tw.week_start, COUNT(m."user_id")::int AS total_members
      FROM target_weeks tw
      LEFT JOIN "t_memberships" m
        ON m."community_id" = $2 AND m."status" = 'JOINED'
        AND m."created_at" <  ((tw.week_start + INTERVAL '7 days')::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
      GROUP BY tw.week_start
    )
    SELECT tw.week_start,
           COALESCE(rc.retained_senders, 0)::int AS retained_senders,
           COALESCE(rc.churned_senders, 0)::int AS churned_senders,
           COALESCE(rc.returned_senders, 0)::int AS returned_senders,
           COALESCE(rc.current_senders_count, 0)::int AS current_senders_count,
           COALESCE(rc.current_active_count, 0)::int AS current_active_count,
           COALESCE(nm.new_members, 0)::int AS new_members,
           COALESCE(tm.total_members, 0)::int AS total_members
    FROM target_weeks tw
    LEFT JOIN retention_counts rc ON rc.week_start = tw.week_start
    LEFT JOIN new_members_per_week nm ON nm.week_start = tw.week_start
    LEFT JOIN total_members_per_week tm ON tm.week_start = tw.week_start
    ORDER BY tw.week_start ASC
    `,
    weekStarts,
    COMMUNITY_ID,
  );
  return performance.now() - t0;
}

/** Loop-style — one findRetentionAggregate + one findMonthActivity per
 *  week, all fired in parallel with Promise.all (old behaviour). */
async function runLoop(weekStarts: Date[]) {
  const t0 = performance.now();
  await Promise.all(
    weekStarts.flatMap((weekStart) => {
      const nextWeekStart = addDays(weekStart, 7);
      const prevWeekStart = addDays(weekStart, -7);
      const twelveWeeksAgo = addDays(weekStart, -84);
      return [
        prisma.$queryRawUnsafe(
          `
          WITH current_week AS (
            SELECT "user_id",
                   BOOL_OR("donation_out_count" > 0) AS is_sender,
                   BOOL_OR("received_donation_count" > 0) AS is_receiver
            FROM "mv_user_transaction_daily"
            WHERE "community_id" = $1
              AND "date" >= $2::date AND "date" < $3::date
            GROUP BY "user_id"
          ),
          prev_week AS (
            SELECT "user_id",
                   BOOL_OR("donation_out_count" > 0) AS is_sender
            FROM "mv_user_transaction_daily"
            WHERE "community_id" = $1
              AND "date" >= $4::date AND "date" < $2::date
            GROUP BY "user_id"
          ),
          ever_before AS (
            SELECT DISTINCT "user_id"
            FROM "mv_user_transaction_daily"
            WHERE "community_id" = $1
              AND "date" >= $5::date AND "date" < $4::date
              AND "donation_out_count" > 0
          )
          SELECT
            COUNT(*) FILTER (WHERE cw.is_sender = true AND pw.is_sender = true)::int AS retained,
            COUNT(*) FILTER (WHERE cw.is_sender = true
                              AND (pw.is_sender IS NULL OR pw.is_sender = false)
                              AND eb."user_id" IS NOT NULL)::int AS returned,
            COUNT(*) FILTER (WHERE pw.is_sender = true
                              AND (cw.is_sender IS NULL OR cw.is_sender = false))::int AS churned
          FROM current_week cw
          FULL OUTER JOIN prev_week pw ON cw."user_id" = pw."user_id"
          LEFT JOIN ever_before eb ON COALESCE(cw."user_id", pw."user_id") = eb."user_id"
          `,
          COMMUNITY_ID,
          weekStart,
          nextWeekStart,
          prevWeekStart,
          twelveWeeksAgo,
        ),
        prisma.$queryRawUnsafe(
          `
          SELECT
            (SELECT COUNT(DISTINCT "user_id")::int
             FROM "mv_user_transaction_daily"
             WHERE "community_id" = $1
               AND "date" >= $2::date AND "date" < $3::date
               AND "donation_out_count" > 0) AS sender_count,
            (SELECT COUNT(*)::int FROM "t_memberships"
             WHERE "community_id" = $1 AND "status" = 'JOINED'
               AND "created_at" < ($3::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')) AS total_members
          `,
          COMMUNITY_ID,
          weekStart,
          nextWeekStart,
        ),
      ];
    }),
  );
  return performance.now() - t0;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

async function main() {
  await seed();

  const weekStarts = buildWeekStarts(ASOF, WINDOW_WEEKS);

  console.log(`\nBenchmarking ${weekStarts.length} weeks...`);

  // Warm-up (planner, caches).
  await runBulk(weekStarts);
  await runLoop(weekStarts);

  const TRIALS = 10;
  const bulkTimes: number[] = [];
  const loopTimes: number[] = [];
  for (let i = 0; i < TRIALS; i++) {
    bulkTimes.push(await runBulk(weekStarts));
    loopTimes.push(await runLoop(weekStarts));
  }

  const bulkMed = median(bulkTimes);
  const loopMed = median(loopTimes);

  console.log(`\nResults (median of ${TRIALS} trials):`);
  console.log(`  bulk: ${bulkMed.toFixed(1)} ms`);
  console.log(`  loop: ${loopMed.toFixed(1)} ms (${(loopTimes.length * 2)} queries in parallel)`);
  console.log(`  speedup: ${(loopMed / bulkMed).toFixed(2)}x`);
  console.log(`\n  bulk samples: ${bulkTimes.map((t) => t.toFixed(0)).join(", ")}`);
  console.log(`  loop samples: ${loopTimes.map((t) => t.toFixed(0)).join(", ")}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
