import "reflect-metadata";
import "@/application/provider";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ReportTemplateKind, ReportTemplateScope } from "@prisma/client";
import { container } from "tsyringe";
import { GqlReportVariant } from "@/types/graphql";
import ReportUseCase from "@/application/domain/report/usecase";
import { addDays, truncateToJstDate } from "@/application/domain/report/util";
import { prismaClient } from "@/infrastructure/prisma/client";
import type { IContext } from "@/types/server";

/**
 * Manual probe: run `generateReport` directly against the backend (no
 * GraphQL hop, no auth tokens) for each isActive GENERATION variant on
 * one or more communities, and dump the LLM output + judge / coverage
 * metadata to disk for human review.
 *
 * Usage:
 *   dotenvx run -f .env.prd -- tsx scripts/probe-reports.ts \
 *     --community=<id1>[,<id2>,...] [--from=YYYY-MM-DD --to=YYYY-MM-DD]
 *
 * `--community` accepts one ID or a CSV of IDs. Each (community,
 * variant) pair runs in isolation — an error on one pair logs and
 * continues so a missing JUDGE template or transient LLM 5xx on one
 * variant doesn't block the rest.
 *
 * The variant set is discovered at startup from the seeded SYSTEM
 * templates (kind=GENERATION, isActive=true, isEnabled=true), so
 * adding a new variant to `seedReportTemplates` automatically pulls it
 * into the probe — no edit to this file required.
 *
 * Default period is the most recent completed 7-day window in JST,
 * matching `generateWeeklyReports.ts`. The `--from` / `--to` overrides
 * are useful for back-filling against an older window or for testing
 * variant prompts that aren't weekly (GRANT_APPLICATION / MEDIA_PR).
 *
 * The script is intentionally idempotent-by-side-effect: every run
 * inserts new t_reports rows (one per community × variant) just like
 * the live `generateReport` mutation, so running it twice in a row
 * produces two sets of rows. Manual cleanup via `t_reports` SQL is
 * fine — these rows aren't published.
 */

/**
 * Discover the GENERATION variants the probe should exercise. The
 * source of truth is the seeded SYSTEM templates: any (variant,
 * GENERATION) row that is both `isActive` and `isEnabled` and lacks a
 * communityId override is in scope. This matches what the live
 * `templateSelector.findActiveTemplates` would surface for an
 * unscoped lookup, so the probe and production paths stay aligned
 * automatically when a new variant is seeded.
 *
 * Variants without a JUDGE counterpart are still probed; the
 * generation step succeeds and the judge step short-circuits inside
 * `judgeAndPersist` (no JUDGE template => coverage-only persist, no
 * auto-reject). The summary still records the result.
 */
async function fetchActiveGenerationVariants(): Promise<string[]> {
  const rows = await prismaClient.reportTemplate.findMany({
    where: {
      kind: ReportTemplateKind.GENERATION,
      scope: ReportTemplateScope.SYSTEM,
      isActive: true,
      isEnabled: true,
      communityId: null,
    },
    distinct: ["variant"],
    select: { variant: true },
    orderBy: { variant: "asc" },
  });
  return rows.map((r) => r.variant);
}

interface CliArgs {
  communityIds: string[];
  periodFrom: Date;
  periodTo: Date;
}

const USAGE =
  "Usage: tsx scripts/probe-reports.ts --community=<id1>[,<id2>,...] [--from=YYYY-MM-DD --to=YYYY-MM-DD]";

/**
 * Throws on bad input rather than calling `process.exit` directly so the
 * caller controls the exit boundary (and the parser stays unit-testable).
 * `main` catches and exits with the usage banner.
 */
function parseArgs(): CliArgs {
  const map = new Map<string, string>();
  for (const a of process.argv.slice(2)) {
    const m = /^--([\w-]+)=(.+)$/.exec(a);
    if (m) map.set(m[1], m[2]);
  }
  const communityArg = map.get("community");
  if (!communityArg) {
    throw new Error(USAGE);
  }
  // CSV-split + trim + drop empties so accidental trailing commas /
  // whitespace from shell expansions don't surface as empty IDs that
  // would later fail at the application layer with a confusing error.
  const communityIds = communityArg
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (communityIds.length === 0) {
    throw new Error("--community must contain at least one non-empty id");
  }
  const fromArg = map.get("from");
  const toArg = map.get("to");
  if ((fromArg && !toArg) || (!fromArg && toArg)) {
    throw new Error("--from and --to must be specified together");
  }
  if (fromArg && toArg) {
    return {
      communityIds,
      periodFrom: new Date(`${fromArg}T00:00:00Z`),
      periodTo: new Date(`${toArg}T00:00:00Z`),
    };
  }
  // Default window: yesterday back 6 days, computed against the JST
  // calendar via the same `truncateToJstDate` helper the live weekly
  // batch uses (`generateWeeklyReports.ts:24-25`). The earlier UTC-only
  // computation drifted by a day during the JST 00:00–09:00 window
  // (= UTC 15:00–24:00 of the prior day) because `getUTCDate()` would
  // still be on "yesterday" while JST had already rolled to "today",
  // landing the probe one day off from what the batch would have run.
  const periodTo = addDays(truncateToJstDate(new Date()), -1);
  const periodFrom = addDays(periodTo, -6);
  return { communityIds, periodFrom, periodTo };
}

/**
 * Bypass-RLS issuer for the probe. The script runs as a privileged
 * backend operator (driven by hand from a developer's shell, hitting
 * prd directly via .env.prd), so RLS scoping is irrelevant — every
 * issuer flavour collapses to "use the raw client". Mirrors the same
 * shim style used by `scripts/ci/run-golden-cases.ts`.
 */
function makeProbeContext(): IContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const passthrough = <T>(fn: (tx: any) => Promise<T>): Promise<T> => fn(prismaClient);
  return {
    issuer: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      public: (_ctx: IContext, fn: any) => passthrough(fn),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      internal: (fn: any) => passthrough(fn),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onlyBelongingCommunity: (_ctx: IContext, fn: any) => passthrough(fn),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      admin: (_ctx: IContext, fn: any) => passthrough(fn),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

/**
 * Subset of `GqlReport` the probe actually consumes. The full GraphQL
 * type carries DataLoader-resolved relationships (`community`,
 * `template`, etc.) that the probe never hydrates — narrowing here
 * keeps the field set explicit and lets typos surface at compile time
 * instead of resolving to `any`.
 */
interface ProbeReport {
  id: string;
  variant: string;
  status: string;
  skipReason: string | null;
  outputMarkdown: string | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  judgeScore: number | null;
  judgeBreakdown: unknown;
  judgeTemplateId: string | null;
  coverageJson: unknown;
  templateId: string | null;
  periodFrom: Date | string;
  periodTo: Date | string;
  createdAt: Date | string;
}

interface VariantOutcome {
  communityId: string;
  variant: string;
  status: string;
  judgeScore: number | null;
  markdownPath: string | null;
  metaPath: string | null;
  error: string | null;
}

interface RunOneArgs {
  usecase: ReportUseCase;
  ctx: IContext;
  communityId: string;
  // `variant` arrives as a raw string from the DB (variant column on
  // t_report_templates is a free-form String, not a Prisma enum) and
  // is cast to `GqlReportVariant` at the usecase boundary below. Keeps
  // the discovery path independent of the codegen union type, so
  // adding a new variant to the seed doesn't require regenerating
  // GraphQL types before the probe can exercise it.
  variant: string;
  periodFrom: Date;
  periodTo: Date;
  outDir: string;
  timestamp: string;
}

/**
 * Sanitize a community id for use as a filename segment. cuid /
 * slug-style ids are already filesystem-safe, but we still strip
 * anything outside `[A-Za-z0-9._-]` defensively in case the prd ever
 * grows ids that contain `/` or whitespace.
 */
function sanitizeForFilename(id: string): string {
  return id.replace(/[^A-Za-z0-9._-]/g, "_");
}

async function runOneVariant(args: RunOneArgs): Promise<VariantOutcome> {
  const { usecase, ctx, communityId, variant, periodFrom, periodTo, outDir, timestamp } =
    args;
  process.stdout.write(`[${communityId}/${variant}] generating... `);
  try {
    const result = await usecase.generateReport(
      {
        input: {
          communityId,
          // GqlReportVariant is the codegen union of seeded variant
          // strings; the cast is sound because we discovered `variant`
          // from the same seed that codegen reads.
          variant: variant as GqlReportVariant,
          periodFrom,
          periodTo,
        },
        permission: { communityId },
      },
      ctx,
    );
    if (result.__typename !== "GenerateReportSuccess") {
      const msg = `non-success payload: ${JSON.stringify(result)}`;
      // Failure-mode messages go to stderr so a wrapping shell can
      // separate them from the OK / Summary stream on stdout.
      console.error(`FAIL ${msg}`);
      return {
        communityId,
        variant,
        status: "ERROR",
        judgeScore: null,
        markdownPath: null,
        metaPath: null,
        error: msg,
      };
    }
    // The Report type carries DataLoader-resolved relationship fields
    // (community / template / parentRun etc.) the probe never hydrates;
    // narrow to the scalar subset we actually consume so typos surface
    // at compile time.
    const r = result.report as unknown as ProbeReport;
    const slug = sanitizeForFilename(communityId);
    const mdPath = join(outDir, `${slug}_${variant}_${timestamp}.md`);
    const metaPath = join(outDir, `${slug}_${variant}_${timestamp}.meta.json`);

    const markdown =
      r.outputMarkdown ??
      `(no LLM output, status=${r.status}, skipReason=${r.skipReason ?? "n/a"})`;
    writeFileSync(mdPath, markdown, "utf-8");

    const meta = {
      reportId: r.id,
      communityId,
      variant: r.variant,
      status: r.status,
      skipReason: r.skipReason ?? null,
      judgeScore: r.judgeScore ?? null,
      judgeBreakdown: r.judgeBreakdown ?? null,
      judgeTemplateId: r.judgeTemplateId ?? null,
      coverageJson: r.coverageJson ?? null,
      templateId: r.templateId ?? null,
      model: r.model ?? null,
      tokens: {
        input: r.inputTokens ?? null,
        output: r.outputTokens ?? null,
        cacheRead: r.cacheReadTokens ?? null,
      },
      periodFrom: r.periodFrom,
      periodTo: r.periodTo,
      createdAt: r.createdAt,
    };
    writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf-8");

    const scoreSuffix = r.judgeScore != null ? ` judge=${r.judgeScore}` : "";
    console.log(`OK status=${r.status}${scoreSuffix}`);
    return {
      communityId,
      variant,
      status: r.status,
      judgeScore: r.judgeScore ?? null,
      markdownPath: mdPath,
      metaPath,
      error: null,
    };
  } catch (e) {
    const msg = (e as Error).message;
    console.error(`ERROR ${msg}`);
    return {
      communityId,
      variant,
      status: "ERROR",
      judgeScore: null,
      markdownPath: null,
      metaPath: null,
      error: msg,
    };
  }
}

async function main(): Promise<void> {
  let args: CliArgs;
  try {
    args = parseArgs();
  } catch (e) {
    // CLI parser surfaces validation errors via throw so it stays
    // unit-testable; main owns the exit boundary.
    console.error((e as Error).message);
    process.exit(1);
  }

  const usecase = container.resolve(ReportUseCase);
  const ctx = makeProbeContext();

  // Discover variants from the seed before opening the output dir so
  // a "no templates seeded" failure is reported up-front, before the
  // operator sees an empty `tmp/reports/` and wonders if the probe ran.
  const variants = await fetchActiveGenerationVariants();
  if (variants.length === 0) {
    console.error(
      "No active SYSTEM GENERATION templates found in t_report_templates. " +
        "Run `pnpm db:seed-report-templates` (or `:dev` / `:prd`) first.",
    );
    await prismaClient.$disconnect();
    process.exit(1);
  }

  const outDir = join(process.cwd(), "tmp", "reports");
  mkdirSync(outDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  console.info(
    `Probe: communities=[${args.communityIds.join(", ")}] period=[${args.periodFrom
      .toISOString()
      .slice(0, 10)}, ${args.periodTo.toISOString().slice(0, 10)}]`,
  );
  console.info(`Discovered variants: [${variants.join(", ")}]`);
  console.info(`Output dir: ${outDir}`);
  console.info("");

  const outcomes: VariantOutcome[] = [];
  for (const communityId of args.communityIds) {
    for (const variant of variants) {
      const outcome = await runOneVariant({
        usecase,
        ctx,
        communityId,
        variant,
        periodFrom: args.periodFrom,
        periodTo: args.periodTo,
        outDir,
        timestamp,
      });
      outcomes.push(outcome);
    }
  }

  console.info("");
  console.info("=== Summary ===");
  // Group by community so the operator can scan one community's status
  // line cluster at a time instead of interleaving 4 variants × N
  // communities in a flat list.
  for (const communityId of args.communityIds) {
    console.info(`[${communityId}]`);
    for (const o of outcomes.filter((x) => x.communityId === communityId)) {
      const judgeSuffix = o.judgeScore != null ? ` judge=${o.judgeScore}` : "";
      const errorSuffix = o.error ? ` (${o.error})` : "";
      const pathSuffix = o.markdownPath ? ` → ${o.markdownPath}` : "";
      console.info(`  ${o.variant}: ${o.status}${judgeSuffix}${pathSuffix}${errorSuffix}`);
    }
  }

  await prismaClient.$disconnect();
  // Exit non-zero if any pair errored so a CI wrapper / batch caller
  // can detect the failure without parsing stdout.
  const hadError = outcomes.some((o) => o.error !== null);
  process.exit(hadError ? 1 : 0);
}

main().catch((e) => {
  console.error("Probe crashed:", e);
  prismaClient.$disconnect().finally(() => process.exit(2));
});
