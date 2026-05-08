import "reflect-metadata";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MembershipStatus } from "@prisma/client";
import { prismaClient } from "@/infrastructure/prisma/client";

/**
 * Export JOINED memberships to CSV so a community manager can fill in
 * `priorActivityClass` / `priorActivityNote` in a spreadsheet and feed
 * the file back through `scripts/import-prior-activity.ts`.
 *
 * Usage:
 *   dotenvx run -f .env.local -- tsx scripts/export-members.ts \
 *     --community=<id1>[,<id2>,...]
 *   dotenvx run -f .env.local -- tsx scripts/export-members.ts
 *
 * `--community` accepts one ID or a CSV of IDs. When omitted, every
 * community in the database is exported. One file per community is
 * written to `tmp/members_export_<communityId>_<timestamp>.csv` so
 * managers can hand each community its own sheet without leaking
 * other communities' member lists.
 *
 * Only JOINED memberships are exported — PENDING / LEFT rows are not
 * actionable for a "civicship 導入前から動いていたか" question.
 *
 * Existing `priorActivity*` values are preserved in the export so a
 * manager re-running the workflow against an already-populated
 * community sees their prior entries and only fills in the gaps.
 */

const USAGE =
  "Usage: tsx scripts/export-members.ts [--community=<id1>[,<id2>,...]] [--out-dir=<path>]";

interface CliArgs {
  communityIds: string[] | null;
  outDir: string;
}

/**
 * Throws on bad input rather than calling `process.exit` directly so
 * the parser stays unit-testable and `main` owns the exit boundary —
 * mirrors `scripts/probe-reports.ts:parseArgs`.
 */
function parseArgs(): CliArgs {
  const map = new Map<string, string>();
  for (const a of process.argv.slice(2)) {
    const m = /^--([\w-]+)=(.+)$/.exec(a);
    if (m) map.set(m[1], m[2]);
  }
  const communityArg = map.get("community");
  let communityIds: string[] | null = null;
  if (communityArg !== undefined) {
    communityIds = communityArg
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (communityIds.length === 0) {
      throw new Error("--community must contain at least one non-empty id");
    }
  }
  const outDir = map.get("out-dir") ?? join(process.cwd(), "tmp");
  return { communityIds, outDir };
}

/**
 * RFC 4180 minimal quoter. Wraps the value in quotes only when it
 * contains a delimiter (`,`), a quote, or a newline; doubles embedded
 * quotes. Avoids a CSV library dependency for a 7-column writer.
 */
function csvField(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Render a Date as `YYYY-MM-DD` in UTC. Only used for `joinedAt`
 * (system-recorded) — there is no editable date column in the export.
 */
function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

const HEADER = [
  "userId",
  "name",
  "communityId",
  "communityName",
  "joinedAt",
  "priorActivityClass",
  "priorActivityNote",
] as const;

interface MembershipRow {
  userId: string;
  userName: string;
  communityId: string;
  communityName: string;
  joinedAt: Date;
  priorActivityClass: string | null;
  priorActivityNote: string | null;
}

async function fetchMemberships(communityIds: string[] | null): Promise<MembershipRow[]> {
  const rows = await prismaClient.membership.findMany({
    where: {
      status: MembershipStatus.JOINED,
      ...(communityIds ? { communityId: { in: communityIds } } : {}),
    },
    select: {
      userId: true,
      communityId: true,
      createdAt: true,
      priorActivityClass: true,
      priorActivityNote: true,
      user: { select: { name: true } },
      community: { select: { name: true } },
    },
    orderBy: [{ communityId: "asc" }, { user: { name: "asc" } }, { userId: "asc" }],
  });
  return rows.map((r) => ({
    userId: r.userId,
    userName: r.user?.name ?? "",
    communityId: r.communityId,
    communityName: r.community?.name ?? "",
    joinedAt: r.createdAt,
    priorActivityClass: r.priorActivityClass,
    priorActivityNote: r.priorActivityNote,
  }));
}

function sanitizeForFilename(id: string): string {
  return id.replace(/[^A-Za-z0-9._-]/g, "_");
}

function buildCsv(rows: MembershipRow[]): string {
  const lines = [HEADER.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvField(r.userId),
        csvField(r.userName),
        csvField(r.communityId),
        csvField(r.communityName),
        csvField(formatDate(r.joinedAt)),
        csvField(r.priorActivityClass),
        csvField(r.priorActivityNote),
      ].join(","),
    );
  }
  return lines.join("\n") + "\n";
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

  const allRows = await fetchMemberships(args.communityIds);

  if (allRows.length === 0) {
    const target = args.communityIds ? `[${args.communityIds.join(", ")}]` : "all communities";
    console.error(`No JOINED memberships found for ${target}.`);
    await prismaClient.$disconnect();
    process.exit(1);
  }

  // Bucket by community so each manager gets a self-contained file.
  const byCommunity = new Map<string, MembershipRow[]>();
  for (const r of allRows) {
    const list = byCommunity.get(r.communityId);
    if (list) list.push(r);
    else byCommunity.set(r.communityId, [r]);
  }

  mkdirSync(args.outDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const outputs: { communityId: string; path: string; rowCount: number }[] = [];
  for (const [communityId, rows] of byCommunity) {
    const filename = `members_export_${sanitizeForFilename(communityId)}_${timestamp}.csv`;
    const path = join(args.outDir, filename);
    writeFileSync(path, buildCsv(rows), "utf-8");
    outputs.push({ communityId, path, rowCount: rows.length });
  }

  console.info("=== Export summary ===");
  for (const o of outputs) {
    console.info(`[${o.communityId}] rows=${o.rowCount} → ${o.path}`);
  }
  console.info(`Total: ${allRows.length} rows across ${outputs.length} community/communities`);

  await prismaClient.$disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error("Export crashed:", e);
  prismaClient.$disconnect().finally(() => process.exit(2));
});
