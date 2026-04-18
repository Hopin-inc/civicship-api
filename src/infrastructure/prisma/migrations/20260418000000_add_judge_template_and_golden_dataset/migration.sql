-- ============================================================================
-- LLM-as-Judge + Golden Dataset (PR-F7 + PR-F8)
--
-- Adds the schema surface for two related capabilities:
--
--   1. Judge results on each Report row: judge_score / judge_breakdown /
--      judge_template_id / coverage_json. Populated by the judge step that
--      now runs immediately after a successful generation. Nullable for
--      backward compatibility with rows generated before this migration
--      and for SKIPPED rows that never call the LLM (and therefore have
--      nothing to grade).
--
--   2. t_report_golden_cases: a small frozen catalog of (variant, payload)
--      fixtures the CI harness regenerates against the live prompt + judge
--      stack on every change. Regressions in either prompt or judge surface
--      as red builds rather than as silent quality drift.
--
-- DB-layer invariants:
--   - judge_template_id has no FK CHECK on kind=JUDGE; the constraint is
--     application-layer (judgeService.selectJudgeTemplate). Tightening this
--     to a CHECK / trigger would force us to keep enum membership in lock
--     step with seed data, which is more brittle than the runtime guard.
--   - (variant, label) on t_report_golden_cases is the natural key for
--     idempotent seeds; the surrogate `id` keeps the foreign-key shape
--     consistent with the rest of the schema.
-- ============================================================================

-- AlterTable
ALTER TABLE "t_reports" ADD COLUMN     "coverage_json" JSONB,
ADD COLUMN     "judge_breakdown" JSONB,
ADD COLUMN     "judge_score" INTEGER,
ADD COLUMN     "judge_template_id" TEXT;

-- CreateTable
CREATE TABLE "t_report_golden_cases" (
    "id" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "payload_fixture" JSONB NOT NULL,
    "judge_criteria" JSONB NOT NULL,
    "min_judge_score" INTEGER NOT NULL DEFAULT 70,
    "forbidden_keys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    -- expected_status uses the same ReportStatus enum as t_reports.status:
    -- NULL = normal DRAFT-expected path (LLM + judge run);
    -- 'SKIPPED' = zero-activity sentinel (skip guard must fire before
    --             any LLM call). The CI harness branches on this column
    --             rather than the previous `min_judge_score === 0`
    --             sentinel so the discriminator is explicit and the
    --             type system catches future status additions.
    "expected_status" "ReportStatus",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_report_golden_cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_report_golden_cases_variant_label_key" ON "t_report_golden_cases"("variant", "label");

-- AddForeignKey
ALTER TABLE "t_reports" ADD CONSTRAINT "t_reports_judge_template_id_fkey" FOREIGN KEY ("judge_template_id") REFERENCES "t_report_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
