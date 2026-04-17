-- ============================================================================
-- Prompt Versioning + SKIPPED Status (PR-F1)
--
-- Phase-F schema foundation for continuous prompt-quality improvement:
--
--   1. t_report_templates gains `kind`/`version`/`is_active`/`experiment_key`/
--      `traffic_weight`/`notes` so multiple prompt revisions coexist under
--      a single (variant, scope, communityId) key and A/B-style selection
--      is possible. Report.templateId pins each generation run to the exact
--      row used.
--
--   2. ReportStatus gains `SKIPPED`, emitted when the payload builder
--      detects zero community activity and the generation pipeline
--      short-circuits without calling the LLM. All LLM artefact columns on
--      t_reports become nullable so skip rows don't need synthetic values,
--      and `skip_reason` records why the run was elided.
--
-- DB-layer invariants retained / extended:
--   - @@unique([variant, community_id, version]) covers COMMUNITY scope.
--     The partial unique index `t_report_templates_variant_system_key` is
--     re-created on (variant, version) WHERE community_id IS NULL, keeping
--     SYSTEM-scope uniqueness per (variant, version) pair. We'd prefer a
--     single `UNIQUE NULLS NOT DISTINCT` constraint, but Prisma 6.11 does
--     not yet accept `nullsNotDistinct` on @@unique.
--   - The existing `t_report_templates_scope_community_id_check` CHECK
--     constraint (scope ⇔ community_id NULL-ness) is untouched.
--   - A new CHECK `t_report_templates_traffic_weight_check` bounds
--     traffic_weight to 0..100; the "weights within an experiment sum to
--     100" invariant remains an application-layer concern.
-- ============================================================================

-- CreateEnum
CREATE TYPE "ReportTemplateKind" AS ENUM ('GENERATION', 'JUDGE');

-- AlterEnum
-- PostgreSQL 12+ allows ADD VALUE inside a transaction as long as the new
-- value is not referenced by data in the same transaction. We only declare
-- it here; rows using SKIPPED arrive in subsequent runtime writes.
ALTER TYPE "ReportStatus" ADD VALUE 'SKIPPED';

-- DropIndex
DROP INDEX "t_report_templates_variant_community_id_key";

-- AlterTable
ALTER TABLE "t_report_templates" ADD COLUMN     "experiment_key" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "kind" "ReportTemplateKind" NOT NULL DEFAULT 'GENERATION',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "traffic_weight" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "t_reports" ADD COLUMN     "skip_reason" TEXT,
ALTER COLUMN "output_markdown" DROP NOT NULL,
ALTER COLUMN "model" DROP NOT NULL,
ALTER COLUMN "system_prompt_snapshot" DROP NOT NULL,
ALTER COLUMN "user_prompt_snapshot" DROP NOT NULL,
ALTER COLUMN "input_tokens" DROP NOT NULL,
ALTER COLUMN "output_tokens" DROP NOT NULL,
ALTER COLUMN "cache_read_tokens" DROP NOT NULL,
ALTER COLUMN "cache_read_tokens" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "t_report_templates_variant_community_id_version_key" ON "t_report_templates"("variant", "community_id", "version");

-- ============================================================================
-- Custom additions beyond Prisma's canonical output
-- ============================================================================

-- Re-create the SYSTEM-scope partial unique index with the new `version`
-- column. The pre-F1 index enforced "one SYSTEM template per variant";
-- with versioning we relax that to "one SYSTEM template per (variant,
-- version)" so a v2 can coexist with v1.
DROP INDEX "t_report_templates_variant_system_key";

CREATE UNIQUE INDEX "t_report_templates_variant_system_key"
    ON "t_report_templates"("variant", "version")
    WHERE "community_id" IS NULL;

-- CheckConstraint: traffic_weight in 0..100 (belt-and-braces alongside the
-- admin-UI validation to be added in PR-F3). The "weights within an
-- experimentKey sum to 100" invariant is NOT enforced here — it is a
-- runtime selection-layer concern that will live in the template-
-- resolution service.
ALTER TABLE "t_report_templates"
    ADD CONSTRAINT "t_report_templates_traffic_weight_check"
    CHECK ("traffic_weight" >= 0 AND "traffic_weight" <= 100);
