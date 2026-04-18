import { ReportTemplateScope } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { ValidationError } from "@/errors/graphql";
import { IReportRepository } from "@/application/domain/report/data/interface";
import { PrismaReportTemplate } from "@/application/domain/report/data/type";
import { renderPromptTemplate } from "@/application/domain/report/util/promptRenderer";
import { LlmClient } from "@/infrastructure/libs/llm";

/**
 * Hard ceiling on the wall-clock time we wait for the judge to score a
 * report. Shorter than the generation timeout because the judge prompt
 * is intentionally cheap (Haiku, ~1k tokens of output) — if it ever
 * runs near the cap we want the timeout to expose the slowdown rather
 * than masking it behind the generation budget.
 */
const JUDGE_TIMEOUT_MS = 60_000;

/**
 * Shape returned by `executeJudge`. Field meanings match the JSON the
 * judge prompt is instructed to emit:
 *
 * - `score`: headline 0..100. The CI threshold lives in
 *   `ReportGoldenCase.minJudgeScore`; the judge itself does not know
 *   about pass/fail.
 * - `breakdown`: per-criterion sub-scores / booleans / free-form text,
 *   carried opaquely so the judge prompt can evolve criteria without
 *   schema changes.
 * - `issues` / `strengths`: arrays of short human-readable notes the
 *   judge surfaces. May be empty.
 *
 * `breakdown` is typed as `Record<string, unknown>` rather than a
 * narrower shape because the judge prompt's criteria set varies per
 * variant; we deliberately preserve unknown keys for future
 * compatibility.
 */
export interface JudgeResult {
  score: number;
  breakdown: Record<string, unknown>;
  issues: string[];
  strengths: string[];
}

/**
 * `executeJudge` rendering inputs. Kept as a typed object so adding a
 * new placeholder later (e.g. `forbidden_keys`) does not require
 * shuffling positional args throughout the call chain.
 */
export interface JudgeExecutionInput {
  outputMarkdown: string;
  inputPayload: unknown;
  judgeCriteria?: unknown;
}

/**
 * Marker class for "the LLM returned, but we couldn't make sense of
 * its response": invalid JSON, missing `score`, wrong outer shape.
 *
 * Distinguishing this from generic `Error` matters because the two
 * failure modes ask for different responses:
 *
 *   - LLM-side failure (network / 5xx / abort) is transient — same
 *     prompt will likely succeed on retry, so the right action is
 *     to log + try again later.
 *   - Parse failure means the JUDGE PROMPT is producing output the
 *     code can't consume. That is a prompt-quality bug, not a
 *     transient blip; alerting on it is the only way to catch judge
 *     prompt regressions early.
 *
 * Callers (usecase, CI script) bucket their logs by checking
 * `instanceof JudgeParseError` so the two streams stay separable in
 * downstream observability without parsing log message strings.
 */
export class JudgeParseError extends Error {
  constructor(
    message: string,
    public readonly rawResponse: string,
  ) {
    super(message);
    this.name = "JudgeParseError";
  }
}

@injectable()
export default class ReportJudgeService {
  constructor(
    @inject("ReportRepository") private readonly repository: IReportRepository,
    @inject("LlmClient") private readonly llmClient: LlmClient,
  ) {}

  /**
   * Resolve the active SYSTEM-scope JUDGE template for `variant`.
   * Returns null when no template exists; the caller should treat that
   * as "skip the judge step" rather than failing the generation.
   */
  async selectJudgeTemplate(
    ctx: IContext,
    variant: string,
  ): Promise<PrismaReportTemplate | null> {
    const template = await this.repository.findJudgeTemplate(ctx, variant);
    if (!template) return null;
    // Defence in depth: even if a COMMUNITY-scope JUDGE row somehow
    // gets seeded past the upstream guard, refuse to use it. Surfacing
    // a hard error here is preferable to silently judging with the
    // wrong prompt.
    if (template.scope === ReportTemplateScope.COMMUNITY) {
      throw new ValidationError(
        `JUDGE template for variant=${variant} must use SYSTEM scope (got COMMUNITY)`,
        ["scope"],
      );
    }
    return template;
  }

  /**
   * Render the judge prompt against (output, payload, criteria), invoke
   * the LLM, and parse the JSON response into a `JudgeResult`.
   *
   * The prompt is instructed to emit JSON only, but we still strip a
   * fenced ```json ... ``` wrapper if the model adds one (cheap belt
   * and braces — Haiku is generally well-behaved here, but the cost of
   * being wrong is the entire judge step failing).
   *
   * Errors surface to the caller as thrown `Error`s; the
   * `judgeReportSafely` wrapper in the usecase swallows them so a
   * judge-step failure never blocks a generation from being persisted.
   */
  async executeJudge(
    ctx: IContext,
    template: PrismaReportTemplate,
    input: JudgeExecutionInput,
  ): Promise<JudgeResult> {
    const userPrompt = renderPromptTemplate(template.userPromptTemplate, {
      output_markdown: input.outputMarkdown,
      input_payload: JSON.stringify(input.inputPayload),
      judge_criteria: JSON.stringify(input.judgeCriteria ?? {}),
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), JUDGE_TIMEOUT_MS);
    let llmResult;
    try {
      llmResult = await this.llmClient.complete({
        system: [{ text: template.systemPrompt, cache: true }],
        messages: [{ role: "user", content: userPrompt }],
        model: template.model,
        maxTokens: template.maxTokens,
        ...(template.temperature !== null && { temperature: template.temperature }),
        ...(template.stopSequences.length > 0 && { stopSequences: template.stopSequences }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    return parseJudgeResponse(llmResult.text);
  }
}

/**
 * Strip an optional ```json ... ``` fence, then `JSON.parse` and shape
 * the result to `JudgeResult`. Throws `JudgeParseError` when the
 * response is not valid JSON, is the wrong outer shape, or is missing
 * the headline `score` field — all three are prompt-quality signals
 * the calling layer should bucket separately from transient LLM
 * failures.
 */
function parseJudgeResponse(raw: string): JudgeResult {
  const trimmed = raw.trim();
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch (e) {
    throw new JudgeParseError(
      `Judge response was not valid JSON: ${(e as Error).message}`,
      raw,
    );
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new JudgeParseError("Judge response is not a JSON object", raw);
  }
  const obj = parsed as Record<string, unknown>;
  const score = obj.score;
  if (typeof score !== "number" || !Number.isFinite(score)) {
    throw new JudgeParseError('Judge response missing numeric "score"', raw);
  }

  const breakdown =
    obj.breakdown && typeof obj.breakdown === "object" && !Array.isArray(obj.breakdown)
      ? (obj.breakdown as Record<string, unknown>)
      : {};
  const issues = Array.isArray(obj.issues) ? obj.issues.filter(isString) : [];
  const strengths = Array.isArray(obj.strengths) ? obj.strengths.filter(isString) : [];

  return {
    score: clampScore(score),
    breakdown,
    issues,
    strengths,
  };
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function clampScore(v: number): number {
  if (v < 0) return 0;
  if (v > 100) return 100;
  return Math.round(v);
}
