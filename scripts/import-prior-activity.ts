import "reflect-metadata";
import { createReadStream } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { pipeline } from "node:stream/promises";
import { MemberPriorActivityClass } from "@prisma/client";
import csvParser from "csv-parser";
import { prismaClient } from "@/infrastructure/prisma/client";

/**
 * Bulk-load `priorActivityClass` / `priorActivityNote` onto existing
 * memberships from a CSV produced by `scripts/export-members.ts`.
 * `priorActivityRecordedBy` is set from the `--recorded-by` argument
 * on every updated row.
 *
 * Usage:
 *   dotenvx run -f .env.local -- tsx scripts/import-prior-activity.ts \
 *     --file=tmp/members_export_<communityId>_<timestamp>.csv \
 *     --recorded-by=<adminUserId> [--dry-run]
 *
 * Trust model: this script bypasses GraphQL authorization and writes
 * directly via the Prisma client. It is admin-only tooling intended
 * for an operator running it from a dev / ops shell with the right
 * `.env`. The `--recorded-by` user id is checked to exist in
 * `t_users`, but no manager-of-the-target-community check is enforced
 * — by convention, only sysadmin / Hopin operators should be running
 * this against prd.
 *
 * Class semantics: the `priorActivityClass` column must be one of
 * `PRE_CIVICSHIP_ACTIVE` (古参) or `POST_CIVICSHIP_ENGAGED` (新規).
 * A blank cell skips the row (nothing to write). Anything else fails
 * the row loudly rather than silently coercing.
 *
 * Skip / error rules:
 *   - `priorActivityClass` blank → row skipped (no write).
 *   - `priorActivityClass` not a known enum → row errored.
 *   - `userId` or `communityId` blank → row errored.
 *   - `priorActivityNote` > 500 chars → row errored (column is VARCHAR(500)).
 *   - membership not found in DB → row errored.
 *
 * The whole CSV is treated as one all-or-nothing batch: if even one
 * row errors, the transaction is rolled back and nothing is written
 * (the per-row outcomes are still printed so the operator knows
 * exactly which cells to fix). This matches the spreadsheet workflow
 * — operators edit, re-run, edit, re-run — and avoids ever leaving
 * a community half-imported.
 *
 * `--dry-run` runs every validation and prints the per-row outcome
 * but rolls back at the end of the transaction, so the operator can
 * verify the diff before committing.
 */

const USAGE =
  "Usage: tsx scripts/import-prior-activity.ts --file=<csvPath> --recorded-by=<userId> [--dry-run]";

interface CliArgs {
  filePath: string;
  recordedBy: string;
  dryRun: boolean;
}

function parseArgs(): CliArgs {
  const map = new Map<string, string>();
  let dryRun = false;
  for (const a of process.argv.slice(2)) {
    if (a === "--dry-run") {
      dryRun = true;
      continue;
    }
    const m = /^--([\w-]+)=(.+)$/.exec(a);
    if (m) map.set(m[1], m[2]);
  }
  const filePath = map.get("file");
  if (!filePath) {
    throw new Error("--file=<csvPath> is required");
  }
  const recordedBy = map.get("recorded-by");
  if (!recordedBy) {
    throw new Error("--recorded-by=<userId> is required");
  }
  return { filePath: resolvePath(filePath), recordedBy, dryRun };
}

interface CsvRow {
  userId: string;
  communityId: string;
  priorActivityClass: string;
  priorActivityNote: string;
}

/**
 * Stream-parse the CSV via `csv-parser`. The export side emits a
 * fixed 7-column header; downstream we only consume the 4 columns
 * the import actually writes (extras are ignored, which keeps the
 * import tolerant of operators adding an "owner notes" column or
 * similar in their spreadsheet).
 *
 * Uses `node:stream/promises` `pipeline` so an error on EITHER the
 * file source (ENOENT / permission) or the parser surfaces as a
 * rejected promise. Attaching `.on("error", reject)` only on the
 * parser would silently drop source-side failures.
 *
 * Memory note: the parsed rows are buffered into one in-memory array
 * before the import transaction runs. This is intentional — the import
 * must succeed-or-rollback as a single transaction (so a partial CSV
 * never leaves the community half-imported), and per-row pre-checks
 * are easier to reason about against a fully-materialised list.
 * Sizing assumption: this script is admin tooling for community
 * onboarding (a few hundred rows per community at the high end).
 * If CSV sizes grow into the tens of thousands the right shape is
 * chunked transactions over a streaming parser, not a bigger array.
 */
async function readCsv(path: string): Promise<CsvRow[]> {
  const rows: CsvRow[] = [];
  // Excel-on-Windows writes UTF-8 CSVs with a leading BOM (U+FEFF).
  // Without stripping it, the first header parses as "﻿userId"
  // and every row's `userId` comes back as undefined → silent
  // "userId is blank" errors on a file that looks correct in a text
  // editor. `mapHeaders` runs once per column at parse time, so the
  // cost is negligible.
  const parser = csvParser({
    mapHeaders: ({ header }) => header.replace(/^\ufeff/, ""),
  });
  parser.on("data", (raw: Record<string, string | undefined>) => {
    rows.push({
      userId: (raw.userId ?? "").trim(),
      communityId: (raw.communityId ?? "").trim(),
      priorActivityClass: (raw.priorActivityClass ?? "").trim(),
      priorActivityNote: (raw.priorActivityNote ?? "").trim(),
    });
  });
  await pipeline(createReadStream(path), parser);
  return rows;
}

/**
 * Coerce the CSV cell to a `MemberPriorActivityClass` enum value.
 * Returns "BLANK" when the cell is empty (caller skips the row) and
 * "INVALID" when it is non-empty but does not match any enum member
 * (caller errors the row). Strings come from `csv-parser` already
 * trimmed in `readCsv`, so we do not re-trim here.
 */
function parseClass(s: string): MemberPriorActivityClass | "INVALID" | "BLANK" {
  if (s === "") return "BLANK";
  if (s === MemberPriorActivityClass.PRE_CIVICSHIP_ACTIVE) {
    return MemberPriorActivityClass.PRE_CIVICSHIP_ACTIVE;
  }
  if (s === MemberPriorActivityClass.POST_CIVICSHIP_ENGAGED) {
    return MemberPriorActivityClass.POST_CIVICSHIP_ENGAGED;
  }
  return "INVALID";
}

interface RowOutcome {
  userId: string;
  communityId: string;
  status: "updated" | "skipped" | "error";
  reason?: string;
}

async function main(): Promise<void> {
  let args: CliArgs;
  try {
    args = parseArgs();
  } catch (e) {
    console.error((e as Error).message);
    console.error(USAGE);
    process.exit(1);
  }

  const recorder = await prismaClient.user.findUnique({
    where: { id: args.recordedBy },
    select: { id: true, name: true },
  });
  if (!recorder) {
    console.error(`--recorded-by=${args.recordedBy} does not match any user.`);
    await prismaClient.$disconnect();
    process.exit(1);
  }
  console.info(`Recorder: ${recorder.id} (${recorder.name ?? "<no name>"})`);

  const rows = await readCsv(args.filePath);
  console.info(`Read ${rows.length} rows from ${args.filePath}`);
  console.info(args.dryRun ? "Mode: DRY RUN (no writes will be committed)" : "Mode: COMMIT");
  console.info("");

  const outcomes: RowOutcome[] = [];

  // Pre-fetch every membership referenced by the CSV in a single
  // round-trip and key it by `${userId}::${communityId}` so the
  // per-row existence check inside the transaction is an O(1) map
  // lookup instead of one `findUnique` per row. On a several-hundred-
  // row backfill this collapses N queries into one and keeps the
  // transaction well within its 60s budget.
  const candidatePairs = rows
    .filter((r) => r.userId && r.communityId)
    .map((r) => ({ userId: r.userId, communityId: r.communityId }));
  const existingMemberships =
    candidatePairs.length === 0
      ? []
      : await prismaClient.membership.findMany({
          where: { userId_communityId: { in: candidatePairs } },
          select: { userId: true, communityId: true },
        });
  const existingKeys = new Set(
    existingMemberships.map((m) => `${m.userId}::${m.communityId}`),
  );

  // Wrap every row in one transaction so dry-run can roll back as a
  // group, and so a partial failure on commit mode aborts cleanly
  // instead of leaving the community in a half-imported state.
  //
  // Prisma's interactive-transaction default timeout is 5s, which is
  // tight once an operator runs this against a backfill of a few
  // hundred members over a slow connection. Raise both `timeout`
  // (overall budget) and `maxWait` (queue wait before the tx slot
  // opens) to one minute — well above any realistic admin batch and
  // still bounded so a runaway script does not pin a connection.
  await prismaClient
    .$transaction(
      async (tx) => {
        for (const r of rows) {
          if (!r.userId || !r.communityId) {
            outcomes.push({
              userId: r.userId,
              communityId: r.communityId,
              status: "error",
              reason: "userId or communityId is blank",
            });
            continue;
          }
          const classParsed = parseClass(r.priorActivityClass);
          if (classParsed === "BLANK") {
            outcomes.push({
              userId: r.userId,
              communityId: r.communityId,
              status: "skipped",
              reason: "priorActivityClass blank",
            });
            continue;
          }
          if (classParsed === "INVALID") {
            outcomes.push({
              userId: r.userId,
              communityId: r.communityId,
              status: "error",
              reason: `priorActivityClass not a known enum: "${r.priorActivityClass}"`,
            });
            continue;
          }

          // Pre-check the note against the column's VARCHAR(500) bound
          // before queuing the update. Without this, a single oversize
          // cell would surface as a Prisma `P2000` mid-transaction and
          // roll the entire batch back, hiding which row was at fault.
          // Reporting it row-by-row lets the operator fix that one cell
          // and re-run.
          if (r.priorActivityNote.length > 500) {
            outcomes.push({
              userId: r.userId,
              communityId: r.communityId,
              status: "error",
              reason: `priorActivityNote too long (${r.priorActivityNote.length} > 500)`,
            });
            continue;
          }

          if (!existingKeys.has(`${r.userId}::${r.communityId}`)) {
            outcomes.push({
              userId: r.userId,
              communityId: r.communityId,
              status: "error",
              reason: "membership not found (re-export from this community first)",
            });
            continue;
          }

          await tx.membership.update({
            where: {
              userId_communityId: { userId: r.userId, communityId: r.communityId },
            },
            data: {
              priorActivityClass: classParsed,
              // Empty note is normalized to NULL so a manager clearing a
              // cell in the spreadsheet round-trips back to "no note"
              // instead of an empty-string row that's surprising to query.
              priorActivityNote: r.priorActivityNote === "" ? null : r.priorActivityNote,
              priorActivityRecordedBy: args.recordedBy,
            },
          });
          outcomes.push({
            userId: r.userId,
            communityId: r.communityId,
            status: "updated",
          });
        }

        // The header docstring promises "succeed-or-rollback as a single
        // transaction (so a partial CSV never leaves the community
        // half-imported)". Honour that here: if any row failed
        // validation, throw to roll the whole batch back. The
        // per-row outcomes array survives (it is closed-over from
        // outside the tx callback), so the summary printed below
        // still tells the operator exactly which rows to fix before
        // re-running.
        const errored = outcomes.some((o) => o.status === "error");
        if (errored) {
          throw new ValidationRollback();
        }

        if (args.dryRun) {
          // Throw inside the transaction callback so Prisma rolls back
          // every update we just queued. The catch in the surrounding
          // try/finally below swallows this specific marker and reports
          // the dry-run summary on the way out.
          throw new DryRunRollback();
        }
      },
      { timeout: 60_000, maxWait: 60_000 },
    )
    .catch((e: unknown) => {
      if (e instanceof DryRunRollback) return;
      if (e instanceof ValidationRollback) return;
      throw e;
    });

  const counts = {
    updated: outcomes.filter((o) => o.status === "updated").length,
    skipped: outcomes.filter((o) => o.status === "skipped").length,
    errored: outcomes.filter((o) => o.status === "error").length,
  };

  console.info("=== Per-row outcomes ===");
  for (const o of outcomes) {
    const reason = o.reason ? ` (${o.reason})` : "";
    console.info(`  [${o.status}] ${o.userId} / ${o.communityId}${reason}`);
  }
  console.info("");
  console.info("=== Summary ===");
  // When validation errors fire, the transaction is rolled back, so
  // the per-row "updated" count reflects rows that *would have*
  // committed had the batch passed validation — not rows that
  // landed in the DB. Re-label it to avoid telling the operator
  // they have a partial write when they do not.
  const rolledBack = args.dryRun || counts.errored > 0;
  const updatedLabel = rolledBack ? "updated (rolled back)" : "updated";
  console.info(`${updatedLabel}: ${counts.updated}`);
  console.info(`skipped: ${counts.skipped}`);
  console.info(`errored: ${counts.errored}`);
  if (args.dryRun) {
    console.info("(dry-run — no writes committed)");
  } else if (counts.errored > 0) {
    console.info("(validation errors — transaction rolled back, no writes committed)");
  }

  await prismaClient.$disconnect();
  // Exit non-zero when there were row-level errors so a wrapper /
  // CI invocation can detect the failure without parsing stdout.
  process.exit(counts.errored > 0 ? 1 : 0);
}

class DryRunRollback extends Error {
  constructor() {
    super("dry-run rollback");
    this.name = "DryRunRollback";
  }
}

class ValidationRollback extends Error {
  constructor() {
    super("validation rollback");
    this.name = "ValidationRollback";
  }
}

main().catch((e) => {
  console.error("Import crashed:", e);
  prismaClient.$disconnect().finally(() => process.exit(2));
});
