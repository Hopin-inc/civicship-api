import "reflect-metadata";
import "@/application/provider";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { container } from "tsyringe";
import { GqlReportVariant } from "@/types/graphql";
import ReportUseCase from "@/application/domain/report/usecase";
import { prismaClient } from "@/infrastructure/prisma/client";
import type { IContext } from "@/types/server";

/**
 * Manual probe: run `generateReport` directly against the backend (no
 * GraphQL hop, no auth tokens) for each isActive GENERATION variant on
 * a single community, and dump the LLM output + judge / coverage
 * metadata to disk for human review.
 *
 * Usage:
 *   dotenvx run -f .env.prd -- tsx scripts/probe-reports.ts \
 *     --community=<communityId> [--from=YYYY-MM-DD --to=YYYY-MM-DD]
 *
 * Default period is the most recent completed 7-day window in JST,
 * matching `generateWeeklyReports.ts`. The `--from` / `--to` overrides
 * are useful for back-filling against an older window or for testing
 * variant prompts that aren't weekly (GRANT_APPLICATION / MEDIA_PR).
 *
 * The script is intentionally idempotent-by-side-effect: every run
 * inserts new t_reports rows (one per variant) just like the live
 * `generateReport` mutation, so running it twice in a row produces two
 * sets of rows. Manual cleanup via `t_reports` SQL is fine — these
 * rows aren't published.
 */

const PROBE_VARIANTS = [
  GqlReportVariant.WeeklySummary,
  GqlReportVariant.GrantApplication,
  GqlReportVariant.MediaPr,
  GqlReportVariant.MemberNewsletter,
] as const;

interface CliArgs {
  communityId: string;
  periodFrom: Date;
  periodTo: Date;
}

const USAGE =
  "Usage: tsx scripts/probe-reports.ts --community=<id> [--from=YYYY-MM-DD --to=YYYY-MM-DD]";

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
  const communityId = map.get("community");
  if (!communityId) {
    throw new Error(USAGE);
  }
  const fromArg = map.get("from");
  const toArg = map.get("to");
  if ((fromArg && !toArg) || (!fromArg && toArg)) {
    throw new Error("--from and --to must be specified together");
  }
  if (fromArg && toArg) {
    return {
      communityId,
      periodFrom: new Date(`${fromArg}T00:00:00Z`),
      periodTo: new Date(`${toArg}T00:00:00Z`),
    };
  }
  // Default window: yesterday back 6 days (the same 7-day inclusive
  // window the live weekly batch uses). Operating in UTC at this layer
  // is fine because `generateReport` itself runs the values through
  // `truncateToJstDate` before persisting.
  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const periodTo = new Date(todayUtc);
  periodTo.setUTCDate(periodTo.getUTCDate() - 1);
  const periodFrom = new Date(periodTo);
  periodFrom.setUTCDate(periodFrom.getUTCDate() - 6);
  return { communityId, periodFrom, periodTo };
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
  variant: string;
  status: string;
  judgeScore: number | null;
  markdownPath: string | null;
  metaPath: string | null;
  error: string | null;
}

async function runOneVariant(
  usecase: ReportUseCase,
  ctx: IContext,
  args: CliArgs,
  variant: GqlReportVariant,
  outDir: string,
  timestamp: string,
): Promise<VariantOutcome> {
  process.stdout.write(`[${variant}] generating... `);
  try {
    const result = await usecase.generateReport(
      {
        input: {
          communityId: args.communityId,
          variant,
          periodFrom: args.periodFrom,
          periodTo: args.periodTo,
        },
        permission: { communityId: args.communityId },
      },
      ctx,
    );
    if (result.__typename !== "GenerateReportSuccess") {
      const msg = `non-success payload: ${JSON.stringify(result)}`;
      // Failure-mode messages go to stderr so a wrapping shell can
      // separate them from the OK / Summary stream on stdout.
      console.error(`FAIL ${msg}`);
      return {
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
    const mdPath = join(outDir, `${variant}_${timestamp}.md`);
    const metaPath = join(outDir, `${variant}_${timestamp}.meta.json`);

    const markdown =
      r.outputMarkdown ??
      `(no LLM output, status=${r.status}, skipReason=${r.skipReason ?? "n/a"})`;
    writeFileSync(mdPath, markdown, "utf-8");

    const meta = {
      reportId: r.id,
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

  const outDir = join(process.cwd(), "tmp", "reports");
  mkdirSync(outDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  console.info(
    `Probe: community=${args.communityId} period=[${args.periodFrom
      .toISOString()
      .slice(0, 10)}, ${args.periodTo.toISOString().slice(0, 10)}]`,
  );
  console.info(`Output dir: ${outDir}`);
  console.info("");

  const outcomes: VariantOutcome[] = [];
  for (const variant of PROBE_VARIANTS) {
    const outcome = await runOneVariant(usecase, ctx, args, variant, outDir, timestamp);
    outcomes.push(outcome);
  }

  console.info("");
  console.info("=== Summary ===");
  for (const o of outcomes) {
    const judgeSuffix = o.judgeScore != null ? ` judge=${o.judgeScore}` : "";
    const errorSuffix = o.error ? ` (${o.error})` : "";
    const pathSuffix = o.markdownPath ? ` → ${o.markdownPath}` : "";
    console.info(`${o.variant}: ${o.status}${judgeSuffix}${pathSuffix}${errorSuffix}`);
  }

  await prismaClient.$disconnect();
  // Exit non-zero if any variant errored so a CI wrapper / batch caller
  // can detect the failure without parsing stdout.
  const hadError = outcomes.some((o) => o.error !== null);
  process.exit(hadError ? 1 : 0);
}

main().catch((e) => {
  console.error("Probe crashed:", e);
  prismaClient.$disconnect().finally(() => process.exit(2));
});
