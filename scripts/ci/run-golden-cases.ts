import "reflect-metadata";
import { container } from "tsyringe";
import { prismaClient } from "@/infrastructure/prisma/client";
import { AnthropicLlmClient } from "@/infrastructure/libs/llm";
import ReportService from "@/application/domain/report/service";
import ReportJudgeService from "@/application/domain/report/judgeService";
import ReportRepository from "@/application/domain/report/data/repository";
import { renderPromptTemplate } from "@/application/domain/report/util/promptRenderer";
import { analyzeCoverage } from "@/application/domain/report/util/coverage";
import type { WeeklyReportPayload } from "@/application/domain/report/types";
import type { IContext } from "@/types/server";

/**
 * Golden-case CI harness.
 *
 * For each row in `t_report_golden_cases`:
 *   1. Resolve the active GENERATION template (kind=GENERATION,
 *      isEnabled=true, scope=SYSTEM) for the case's variant.
 *   2. Evaluate the skip guard against the fixture payload. If the
 *      guard fires, the case is treated as the "SKIPPED expected"
 *      sentinel — minJudgeScore must be 0, otherwise the harness
 *      fails (a non-zero threshold on a SKIPPED-expected case is a
 *      seed-data bug).
 *   3. Otherwise, call the LLM with the live generation prompt to
 *      produce the markdown output.
 *   4. Check forbiddenKeys against the output (any hit fails).
 *   5. Resolve the active JUDGE template; missing JUDGE template fails
 *      (the dataset's whole purpose is the judge signal).
 *   6. Run the judge with the case's judgeCriteria; if score <
 *      minJudgeScore, fail.
 *
 * Exit code 0 = all cases pass. Exit code 1 = at least one case
 * failed (the harness still runs every case so the report shows the
 * full set of failures, not just the first).
 *
 * The harness intentionally does NOT persist anything to the database
 * — it only reads templates + golden cases. Generated outputs and
 * judge results are printed to stdout for the CI log and discarded.
 *
 * Required environment:
 *   DATABASE_URL    — to read templates and golden cases
 *   ANTHROPIC_API_KEY — to invoke the LLM (generation + judge)
 */

// Minimal IContext shim sufficient for repository public reads. The
// CI harness reads from t_report_templates and t_report_golden_cases
// only; both go through `ctx.issuer.public` which the production
// PrismaClientIssuer expects to resolve to a public-scoped session.
function makeCiContext(): IContext {
  return {
    issuer: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      public: (_ctx: IContext, fn: (tx: any) => Promise<unknown>) => fn(prismaClient),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      internal: (fn: (tx: any) => Promise<unknown>) => fn(prismaClient),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

interface CaseOutcome {
  variant: string;
  label: string;
  pass: boolean;
  reason: string;
  score?: number;
  detail?: string;
}

const GENERATION_TIMEOUT_MS = 180_000;

async function runOneCase(
  ctx: IContext,
  service: ReportService,
  judgeService: ReportJudgeService,
  llmClient: AnthropicLlmClient,
  goldenCase: {
    id: string;
    variant: string;
    label: string;
    payloadFixture: unknown;
    judgeCriteria: unknown;
    minJudgeScore: number;
    forbiddenKeys: string[];
    notes: string | null;
  },
): Promise<CaseOutcome> {
  const payload = goldenCase.payloadFixture as WeeklyReportPayload;

  const skipReason = service.evaluateSkipReason(payload);
  if (skipReason) {
    if (goldenCase.minJudgeScore !== 0) {
      return {
        variant: goldenCase.variant,
        label: goldenCase.label,
        pass: false,
        reason: `SKIPPED-expected case has non-zero minJudgeScore=${goldenCase.minJudgeScore}; should be 0`,
      };
    }
    return {
      variant: goldenCase.variant,
      label: goldenCase.label,
      pass: true,
      reason: `SKIPPED as expected (${skipReason})`,
    };
  }

  const template = await service.getTemplate(ctx, goldenCase.variant, null);
  if (!template) {
    return {
      variant: goldenCase.variant,
      label: goldenCase.label,
      pass: false,
      reason: `No GENERATION template found for variant=${goldenCase.variant}`,
    };
  }

  const userPrompt = renderPromptTemplate(template.userPromptTemplate, {
    payload_json: JSON.stringify(payload),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);
  let outputMarkdown: string;
  try {
    const llmResult = await llmClient.complete({
      system: [{ text: template.systemPrompt, cache: true }],
      messages: [{ role: "user", content: userPrompt }],
      model: template.model,
      maxTokens: template.maxTokens,
      ...(template.temperature !== null && { temperature: template.temperature }),
      ...(template.stopSequences.length > 0 && { stopSequences: template.stopSequences }),
      signal: controller.signal,
    });
    outputMarkdown = llmResult.text;
  } finally {
    clearTimeout(timeout);
  }

  const forbiddenHit = goldenCase.forbiddenKeys.find((k) => outputMarkdown.includes(k));
  if (forbiddenHit) {
    return {
      variant: goldenCase.variant,
      label: goldenCase.label,
      pass: false,
      reason: `Forbidden key found in output: "${forbiddenHit}"`,
      detail: outputMarkdown.slice(0, 400),
    };
  }

  const judgeTemplate = await judgeService.selectJudgeTemplate(ctx, goldenCase.variant);
  if (!judgeTemplate) {
    return {
      variant: goldenCase.variant,
      label: goldenCase.label,
      pass: false,
      reason: `No active JUDGE template for variant=${goldenCase.variant}`,
    };
  }

  let judgeResult;
  try {
    judgeResult = await judgeService.executeJudge(ctx, judgeTemplate, {
      outputMarkdown,
      inputPayload: payload,
      judgeCriteria: goldenCase.judgeCriteria,
    });
  } catch (e) {
    return {
      variant: goldenCase.variant,
      label: goldenCase.label,
      pass: false,
      reason: `Judge execution failed: ${(e as Error).message}`,
    };
  }

  const coverage = analyzeCoverage(payload, outputMarkdown);
  const detail = `score=${judgeResult.score}; coverage=${JSON.stringify(coverage)}; issues=${JSON.stringify(judgeResult.issues)}`;

  if (judgeResult.score < goldenCase.minJudgeScore) {
    return {
      variant: goldenCase.variant,
      label: goldenCase.label,
      pass: false,
      reason: `Judge score ${judgeResult.score} < minJudgeScore ${goldenCase.minJudgeScore}`,
      score: judgeResult.score,
      detail,
    };
  }

  return {
    variant: goldenCase.variant,
    label: goldenCase.label,
    pass: true,
    reason: `Judge score ${judgeResult.score} >= minJudgeScore ${goldenCase.minJudgeScore}`,
    score: judgeResult.score,
    detail,
  };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is required to run the golden-case harness.");
    process.exit(2);
  }

  container.register("prismaClient", { useValue: prismaClient });
  container.register("ReportRepository", { useClass: ReportRepository });
  container.register("ReportService", { useClass: ReportService });
  container.register("LlmClient", { useClass: AnthropicLlmClient });
  container.register("ReportJudgeService", { useClass: ReportJudgeService });

  const service = container.resolve(ReportService);
  const judgeService = container.resolve(ReportJudgeService);
  const llmClient = container.resolve(AnthropicLlmClient);
  const ctx = makeCiContext();

  const goldenCases = await service.getGoldenCases(ctx);
  if (goldenCases.length === 0) {
    console.error("No golden cases found. Run `pnpm db:seed-report-golden-cases` first.");
    process.exit(2);
  }

  console.info(`Running ${goldenCases.length} golden cases...`);
  const outcomes: CaseOutcome[] = [];
  for (const c of goldenCases) {
    console.info(`\n[${c.variant}/${c.label}] ${c.notes ?? ""}`);
    const outcome = await runOneCase(ctx, service, judgeService, llmClient, c);
    outcomes.push(outcome);
    const status = outcome.pass ? "PASS" : "FAIL";
    console.info(`  ${status}: ${outcome.reason}`);
    if (outcome.detail) console.info(`  detail: ${outcome.detail}`);
  }

  const failed = outcomes.filter((o) => !o.pass);
  console.info(`\n=== Summary ===`);
  console.info(`Total: ${outcomes.length}, Passed: ${outcomes.length - failed.length}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.info(`Failures:`);
    for (const f of failed) {
      console.info(`  - ${f.variant}/${f.label}: ${f.reason}`);
    }
  }

  await prismaClient.$disconnect();
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Golden-case harness crashed:", e);
  prismaClient.$disconnect().finally(() => process.exit(2));
});
