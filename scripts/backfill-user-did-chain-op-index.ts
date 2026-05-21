#!/usr/bin/env -S node --experimental-strip-types
/**
 * Backfill `chainOpIndex` on `UserDidAnchor` rows that were anchored on
 * Cardano by an older `backfill-user-did.ts` run which never persisted the
 * on-chain operation position.
 *
 * Why this script exists
 * ----------------------
 *
 * `scripts/backfill-user-did.ts` — before its `chainOpIndex` fix — submitted
 * ~1466 CREATE ops to Cardano and marked the rows `CONFIRMED`, but its
 * `updateMany` only wrote `status / chainTxHash / batchId`. It never stamped
 * `chainOpIndex` (unlike `AnchorBatchService.markSubmitted`, which does).
 *
 * The verifier locates a DID operation inside a tx via
 * `metadata.ops[chainOpIndex]` (see `scripts/verify-from-chain.ts` and
 * §8.3 chain inclusion). A `CONFIRMED` anchor whose `chainOpIndex` is NULL
 * is therefore unverifiable — exactly the state the prd backfill left
 * 1466 rows in.
 *
 * What this script does
 * ---------------------
 *
 *   1. SELECT `UserDidAnchor` rows that are on chain
 *      (`status IN (SUBMITTED, CONFIRMED)`, `chainTxHash IS NOT NULL`,
 *      `operation IN (CREATE, UPDATE)`) but still have `chainOpIndex IS NULL`.
 *      DEACTIVATE ops carry no on-chain doc hash, so they cannot be
 *      cross-checked and are out of scope (manual triage only).
 *   2. Group those rows by `chainTxHash`.
 *   3. For each distinct tx: fetch Cardano metadata label 1985 via
 *      Blockfrost and read the ordered `ops[]` array.
 *   4. Match each DB row to its op by `did`, cross-checked against the op
 *      kind (`k`) and the document hash (`h` vs `documentHash`). The op's
 *      0-based index in `ops[]` is the row's `chainOpIndex`.
 *   5. UPDATE the row with the derived index.
 *
 * Idempotency / safety
 * --------------------
 *
 *   - `--confirm` 無しは dry-run（DB write も Blockfrost 呼び出しもしない）。
 *   - `chainOpIndex` が既に入っている行は SELECT 段階で対象外。再実行安全。
 *   - status は一切変更しない（`chainOpIndex` のみを additive に書く）。
 *   - chain と DB が食い違う行（`h` mismatch / `did` 不在 / 同一 tx 内で
 *     did+kind+hash が一意に絞れない）は **書き込まず** UNRESOLVED として
 *     stderr に出し、exit code 1 で運用者に手動 triage を促す。
 *
 * Required env (loaded from `.env.prd` / `.env.dev` via dotenvx):
 *   BLOCKFROST_PROJECT_ID, CARDANO_NETWORK, DATABASE_URL
 *
 * 実行例:
 *   pnpm exec dotenvx run -f .env.prd -- pnpm exec tsx scripts/backfill-user-did-chain-op-index.ts
 *   pnpm exec dotenvx run -f .env.prd -- pnpm exec tsx scripts/backfill-user-did-chain-op-index.ts --confirm
 *
 * Exit codes: 0 = every targeted row resolved (or nothing to do),
 *             1 = at least one row could not be resolved.
 */

import "reflect-metadata";

import { AnchorStatus, ChainNetwork, DidOperation } from "@prisma/client";

import { prismaClient } from "@/infrastructure/prisma/client";
import { BlockfrostClient } from "@/infrastructure/libs/blockfrost/client";
import { METADATA_LABEL_1985 } from "@/infrastructure/libs/cardano/txBuilder";

import { parseConfirmLimitFlags, runScript, runStep } from "./lib/cardanoScriptHelpers.ts";

/** Resolve the Cardano network from env (mirrors `backfill-user-did.ts`). */
function resolveChainNetwork(): ChainNetwork {
  const raw = process.env.CARDANO_NETWORK ?? "preprod";
  return raw === "mainnet" ? ChainNetwork.CARDANO_MAINNET : ChainNetwork.CARDANO_PREPROD;
}

interface TargetRow {
  id: string;
  did: string;
  operation: DidOperation;
  documentHash: string;
  chainTxHash: string;
}

/**
 * `UserDidAnchor` rows that are anchored on chain but still lack a
 * `chainOpIndex`.
 *
 * Restricted to CREATE / UPDATE: those ops carry a document hash (`h`) in
 * the on-chain metadata, so the derived index can be cross-checked against
 * `documentHash` before it is written. DEACTIVATE ops carry no `h` (see the
 * `DidOp` shape in txBuilder), so this tool cannot verify them — they are
 * left for manual operator triage rather than risking a wrong index.
 * `FAILED` rows are likewise excluded even when they carry a `chainTxHash`
 * (see `backfill-user-did.ts` SUBMITTABLE_ANCHOR_WHERE).
 */
async function findRowsMissingOpIndex(limit?: number): Promise<TargetRow[]> {
  const rows = await prismaClient.userDidAnchor.findMany({
    where: {
      status: { in: [AnchorStatus.SUBMITTED, AnchorStatus.CONFIRMED] },
      operation: { in: [DidOperation.CREATE, DidOperation.UPDATE] },
      chainTxHash: { not: null },
      chainOpIndex: null,
    },
    select: {
      id: true,
      did: true,
      operation: true,
      documentHash: true,
      chainTxHash: true,
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  // `chainTxHash` is non-null by the `where` filter above; narrow the type.
  return rows.map((r) => ({ ...r, chainTxHash: r.chainTxHash as string }));
}

function groupByTxHash(rows: TargetRow[]): Map<string, TargetRow[]> {
  const groups = new Map<string, TargetRow[]>();
  for (const row of rows) {
    const existing = groups.get(row.chainTxHash);
    if (existing) {
      existing.push(row);
    } else {
      groups.set(row.chainTxHash, [row]);
    }
  }
  return groups;
}

/** A single DID operation as read back from on-chain metadata label 1985. */
interface ChainOp {
  /** 0-based position in the metadata `ops[]` array — i.e. `chainOpIndex`. */
  index: number;
  /** Operation kind: "c" (CREATE) / "u" (UPDATE) / "d" (DEACTIVATE). */
  k: string;
  did: string;
  /** Document hash (64 hex chars); absent on DEACTIVATE ops. */
  h: string | null;
}

/**
 * Blockfrost returns metadata `text` / `bytes` items that exceeded the 64-byte
 * chunk limit as JSON arrays of strings. Join them back into a single string
 * so a chunked `did` compares equal to the DB value.
 */
function normalizeMetadataText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((v) => normalizeMetadataText(v)).join("");
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  // null / undefined / object / symbol: not a meaningful metadata text value.
  return "";
}

/** Parse the ordered `ops[]` array out of a label-1985 `json_metadata` blob. */
function extractOps(jsonMetadata: unknown): ChainOp[] {
  if (!jsonMetadata || typeof jsonMetadata !== "object") {
    throw new TypeError("metadata label 1985 payload is not an object");
  }
  const ops = (jsonMetadata as { ops?: unknown }).ops;
  if (!Array.isArray(ops)) {
    throw new TypeError("metadata label 1985 has no `ops` array");
  }
  return ops.map((op, index) => {
    const o = (op && typeof op === "object" ? op : {}) as Record<string, unknown>;
    return {
      index,
      k: normalizeMetadataText(o.k),
      did: normalizeMetadataText(o.did),
      h: o.h === undefined || o.h === null ? null : normalizeMetadataText(o.h),
    };
  });
}

/** `DidOperation` → metadata-1985 op kind (`k`). */
function operationToK(operation: DidOperation): string {
  switch (operation) {
    case DidOperation.CREATE:
      return "c";
    case DidOperation.UPDATE:
      return "u";
    case DidOperation.DEACTIVATE:
      return "d";
  }
}

interface Match {
  row: TargetRow;
  opIndex: number;
}

interface Unresolved {
  row: TargetRow;
  reason: string;
}

/**
 * Match every DB row in one tx group to its on-chain op and derive the
 * `chainOpIndex`. A row is only resolved when exactly one op matches its
 * `did` + kind, and that op's `h` agrees with the DB `documentHash` — so a
 * row is never pointed at the wrong (or a corrupted) operation.
 */
function resolveTxGroup(
  rows: TargetRow[],
  ops: ChainOp[],
): { matches: Match[]; unresolved: Unresolved[] } {
  const matches: Match[] = [];
  const unresolved: Unresolved[] = [];
  const skip = (row: TargetRow, reason: string): void => {
    unresolved.push({ row, reason });
  };

  for (const row of rows) {
    const expectedK = operationToK(row.operation);
    const sameDid = ops.filter((o) => o.did === row.did);
    if (sameDid.length === 0) {
      skip(row, `did ${row.did} not present in tx ops[]`);
      continue;
    }

    // Narrow by op kind, then by doc hash, so a DID that legitimately
    // appears more than once in the same tx (e.g. CREATE + UPDATE in one
    // weekly batch) is still disambiguated.
    let candidates = sameDid.filter((o) => o.k === expectedK);
    if (candidates.length === 0) {
      skip(row, `did ${row.did} present but no op has kind k='${expectedK}'`);
      continue;
    }
    if (candidates.length > 1) {
      candidates = candidates.filter(
        (o) => o.h !== null && o.h.toLowerCase() === row.documentHash.toLowerCase(),
      );
    }
    if (candidates.length !== 1) {
      skip(row, `ambiguous: ${candidates.length} ops match did+kind+hash`);
      continue;
    }

    const op = candidates[0];
    // Final integrity cross-check. A CREATE/UPDATE op always carries `h` on
    // chain (txBuilder enforces a 64-hex-char hash), and only CREATE/UPDATE
    // rows reach here (findRowsMissingOpIndex filters them). A missing or
    // mismatched hash means the row and the chain disagree, so the index is
    // NOT written — aiming the verifier at the wrong op is worse than
    // leaving `chainOpIndex` NULL.
    if (op.h === null) {
      skip(row, `on-chain op for ${row.operation} row has no doc hash (h); cannot verify`);
      continue;
    }
    if (op.h.toLowerCase() !== row.documentHash.toLowerCase()) {
      skip(row, `doc hash mismatch: chain=${op.h} db=${row.documentHash}`);
      continue;
    }

    matches.push({ row, opIndex: op.index });
  }

  return { matches, unresolved };
}

async function main(): Promise<number> {
  const flags = parseConfirmLimitFlags(process.argv.slice(2));
  process.stdout.write("Backfill UserDidAnchor.chainOpIndex from on-chain metadata\n\n");
  process.stdout.write(`mode: ${flags.confirm ? "EXECUTE" : "DRY-RUN"}\n`);
  if (flags.limit !== undefined) process.stdout.write(`limit: ${flags.limit}\n`);
  process.stdout.write("\n");

  // Step 1 — survey
  const surveyStep = await runStep<TargetRow[]>(
    "db: anchored UserDidAnchor rows missing chainOpIndex",
    async () => {
      const rows = await findRowsMissingOpIndex(flags.limit);
      const txCount = new Set(rows.map((r) => r.chainTxHash)).size;
      return {
        value: rows,
        detail: `${rows.length} row(s) across ${txCount} tx`,
      };
    },
  );
  if (!surveyStep.ok) return 1;
  const rows = surveyStep.value;

  if (rows.length === 0) {
    process.stdout.write(
      "Nothing to do — every anchored UserDidAnchor already has a chainOpIndex.\n",
    );
    return 0;
  }

  const groups = groupByTxHash(rows);

  if (!flags.confirm) {
    process.stdout.write(
      `\nDry-run: would resolve chainOpIndex for ${rows.length} row(s) across ` +
        `${groups.size} tx by reading on-chain metadata label ${METADATA_LABEL_1985}.\n`,
    );
    process.stdout.write("Re-run with `--confirm` to apply.\n");
    return 0;
  }

  // ---------- EXECUTE path below ----------

  const projectId = process.env.BLOCKFROST_PROJECT_ID;
  if (!projectId) throw new Error("BLOCKFROST_PROJECT_ID is unset");
  const client = new BlockfrostClient({ network: resolveChainNetwork() });

  let resolvedTotal = 0;
  let unresolvedTotal = 0;
  let txIdx = 0;

  for (const [txHash, groupRows] of groups) {
    txIdx += 1;
    const step = await runStep<{ resolved: number; unresolved: number }>(
      `chain(${txIdx}/${groups.size}): tx ${txHash} — ${groupRows.length} row(s)`,
      async () => {
        const metadata = await client.getTxMetadata(txHash);
        const label = metadata.find((m) => String(m.label) === String(METADATA_LABEL_1985));
        if (!label) {
          throw new Error(`tx has no metadata under label ${METADATA_LABEL_1985}`);
        }
        const ops = extractOps(label.json_metadata);
        const { matches, unresolved } = resolveTxGroup(groupRows, ops);

        for (const u of unresolved) {
          process.stderr.write(`   UNRESOLVED ${u.row.id} (${u.row.did}): ${u.reason}\n`);
        }

        if (matches.length > 0) {
          // One $transaction per tx group: each row gets a distinct
          // `chainOpIndex`, so per-row `update` is required, and atomicity
          // keeps a crashed run from leaving the group half-stamped.
          await prismaClient.$transaction(
            matches.map((m) =>
              prismaClient.userDidAnchor.update({
                where: { id: m.row.id },
                data: { chainOpIndex: m.opIndex },
              }),
            ),
          );
        }

        return {
          value: { resolved: matches.length, unresolved: unresolved.length },
          detail:
            `${matches.length} resolved, ${unresolved.length} unresolved ` +
            `(on-chain ops[] length=${ops.length})`,
        };
      },
    );
    if (step.ok) {
      resolvedTotal += step.value.resolved;
      unresolvedTotal += step.value.unresolved;
    } else {
      // The whole tx group could not be read / parsed — every row in it
      // is unresolved and needs a re-run or manual triage.
      unresolvedTotal += groupRows.length;
    }
  }

  process.stdout.write(
    `\ntx=${groups.size}, resolved=${resolvedTotal}, unresolved=${unresolvedTotal}\n`,
  );
  return unresolvedTotal === 0 ? 0 : 1;
}

runScript(main, () => prismaClient.$disconnect());
