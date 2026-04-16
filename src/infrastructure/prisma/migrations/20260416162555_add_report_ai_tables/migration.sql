-- ============================================================================
-- Report AI Generation (Phase 1 MVP)
--
-- Three new tables backing the AI-generated community report feature:
--   - t_report_templates: prompt blueprint (per variant, optional community
--     override; community_id NULL marks a SYSTEM-scope template)
--   - t_reports:          immutable record of a single generation run, with
--     snapshots of prompt + context so regeneration/audit is stable even
--     after later template edits
--   - t_report_feedbacks: platform-admin-only QA signal on each run (Phase 2
--     prompt-tuning / eval dataset seed)
--
-- Tables / columns / indexes / FKs are generated via `pnpm db:migrate`
-- (`prisma migrate dev --create-only`). Additional items that Prisma does
-- not emit — partial unique index for the SYSTEM-scope NULL case, the
-- rating CHECK constraint, and Row-Level Security policies — are appended
-- at the bottom of this file.
--
-- RLS aligns with the existing project pattern (see migration
-- 20251106082237_complete_rls_write_only_all_tables):
--   - SELECT unrestricted at DB (USING true); app layer filters by
--     community
--   - INSERT/UPDATE/DELETE require the user's membership to match
--     community_id OR `app.rls_bypass='on'` (set by PrismaClientIssuer's
--     bypassRls paths: public / internal / admin, where admin additionally
--     enforces sysRole='SYS_ADMIN' at the app layer)
--   - t_report_templates SYSTEM-scope rows (community_id IS NULL) cannot
--     match the `community_id IN (...)` check, so SYSTEM edits naturally
--     require bypass → admin-only in practice
--   - t_report_feedbacks is admin-only; it has *only* the bypass policy,
--     so every SELECT/INSERT/UPDATE/DELETE requires bypass. Community
--     members going through `onlyBelongingCommunity` cannot touch it.
-- ============================================================================

-- CreateEnum
CREATE TYPE "ReportTemplateScope" AS ENUM ('SYSTEM', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'APPROVED', 'PUBLISHED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('QUALITY', 'ACCURACY', 'TONE', 'STRUCTURE', 'OTHER');

-- CreateTable
CREATE TABLE "t_report_templates" (
    "id" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "scope" "ReportTemplateScope" NOT NULL,
    "community_id" TEXT,
    "system_prompt" TEXT NOT NULL,
    "user_prompt_template" TEXT NOT NULL,
    "community_context" TEXT,
    "model" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "max_tokens" INTEGER NOT NULL,
    "stop_sequences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_reports" (
    "id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "period_from" DATE NOT NULL,
    "period_to" DATE NOT NULL,
    "template_id" TEXT,
    "input_payload" JSONB NOT NULL,
    "output_markdown" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "system_prompt_snapshot" TEXT NOT NULL,
    "user_prompt_snapshot" TEXT NOT NULL,
    "community_context_snapshot" TEXT,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "cache_read_tokens" INTEGER NOT NULL DEFAULT 0,
    "target_user_id" TEXT,
    "generated_by" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "published_by" TEXT,
    "final_content" TEXT,
    "regenerate_count" INTEGER NOT NULL DEFAULT 0,
    "parent_run_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_report_feedbacks" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback_type" "FeedbackType",
    "section_key" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_report_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_report_templates_variant_community_id_key" ON "t_report_templates"("variant", "community_id");

-- CreateIndex
CREATE INDEX "t_reports_community_id_variant_period_from_idx" ON "t_reports"("community_id", "variant", "period_from" DESC);

-- CreateIndex
CREATE INDEX "t_reports_community_id_status_idx" ON "t_reports"("community_id", "status");

-- CreateIndex
CREATE INDEX "t_reports_parent_run_id_idx" ON "t_reports"("parent_run_id");

-- CreateIndex
CREATE INDEX "t_report_feedbacks_report_id_idx" ON "t_report_feedbacks"("report_id");

-- CreateIndex
CREATE INDEX "t_report_feedbacks_user_id_idx" ON "t_report_feedbacks"("user_id");

-- AddForeignKey
ALTER TABLE "t_report_templates" ADD CONSTRAINT "t_report_templates_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_report_templates" ADD CONSTRAINT "t_report_templates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_reports" ADD CONSTRAINT "t_reports_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_reports" ADD CONSTRAINT "t_reports_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "t_report_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_reports" ADD CONSTRAINT "t_reports_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_reports" ADD CONSTRAINT "t_reports_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_reports" ADD CONSTRAINT "t_reports_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_reports" ADD CONSTRAINT "t_reports_parent_run_id_fkey" FOREIGN KEY ("parent_run_id") REFERENCES "t_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_report_feedbacks" ADD CONSTRAINT "t_report_feedbacks_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "t_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_report_feedbacks" ADD CONSTRAINT "t_report_feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- Custom additions beyond Prisma's canonical output
-- ============================================================================

-- Partial unique index covering SYSTEM-scope templates (community_id IS
-- NULL). PostgreSQL treats NULL as distinct in regular unique indexes,
-- so the composite key above would allow multiple SYSTEM templates per
-- variant. The template-resolution query picks the community override
-- first then falls back to SYSTEM via `ORDER BY community_id NULLS
-- LAST LIMIT 1`, which assumes exactly one SYSTEM template per variant
-- — this partial index enforces that invariant.
-- Prisma's @@unique attribute cannot express partial indexes, so this
-- lives as raw SQL alongside the schema-level @@unique.
CREATE UNIQUE INDEX "t_report_templates_variant_system_key"
    ON "t_report_templates"("variant")
    WHERE "community_id" IS NULL;

-- CheckConstraint: rating in 1..5 (defense-in-depth alongside the
-- GraphQL input validation that will be added in PR-D).
ALTER TABLE "t_report_feedbacks"
    ADD CONSTRAINT "t_report_feedbacks_rating_check"
    CHECK ("rating" BETWEEN 1 AND 5);

-- CheckConstraint: scope ⇔ community_id consistency.
-- SYSTEM templates must have community_id IS NULL; COMMUNITY templates
-- must have community_id IS NOT NULL. Without this invariant the
-- community-scoped write RLS policy could be subverted by mis-shaped
-- rows (e.g. a SYSTEM-scope row carrying a community_id that matches
-- some user's membership would pass the `community_id IN (memberships)`
-- check and be editable by a non-admin), and the partial unique index
-- on `WHERE community_id IS NULL` could be bypassed by storing the
-- "SYSTEM" template under COMMUNITY scope with a real community_id.
ALTER TABLE "t_report_templates"
    ADD CONSTRAINT "t_report_templates_scope_community_id_check"
    CHECK (
      (scope = 'SYSTEM'    AND community_id IS NULL)
      OR
      (scope = 'COMMUNITY' AND community_id IS NOT NULL)
    );

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE "t_report_templates"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_reports"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "t_report_feedbacks"  ENABLE ROW LEVEL SECURITY;

-- --- t_report_templates -----------------------------------------------------
CREATE POLICY community_select_policy ON "t_report_templates"
  FOR SELECT
  USING (true);

CREATE POLICY community_write_policy ON "t_report_templates"
  FOR INSERT
  WITH CHECK (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_update_policy ON "t_report_templates"
  FOR UPDATE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_delete_policy ON "t_report_templates"
  FOR DELETE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_bypass_policy ON "t_report_templates"
  USING (NULLIF(current_setting('app.rls_bypass', true), 'off')::text = 'on');

-- --- t_reports --------------------------------------------------------------
CREATE POLICY community_select_policy ON "t_reports"
  FOR SELECT
  USING (true);

CREATE POLICY community_write_policy ON "t_reports"
  FOR INSERT
  WITH CHECK (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_update_policy ON "t_reports"
  FOR UPDATE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_delete_policy ON "t_reports"
  FOR DELETE
  USING (
    "community_id" IN (
      SELECT "community_id"
      FROM "t_memberships"
      WHERE "user_id" = NULLIF(current_setting('app.rls_config.user_id', true), '')::text
    )
  );

CREATE POLICY community_bypass_policy ON "t_reports"
  USING (NULLIF(current_setting('app.rls_bypass', true), 'off')::text = 'on');

-- --- t_report_feedbacks -----------------------------------------------------
-- Admin-only table: only the bypass policy is permissive. All reads and
-- writes require `app.rls_bypass='on'`, which is set by
-- `PrismaClientIssuer.bypassRls` (called from `issuer.admin()` / `internal()`
-- / `public()`). Only `issuer.admin()` additionally enforces
-- `sysRole='SYS_ADMIN'` at the application layer; the PR-D resolvers are
-- expected to route every feedback read/write through `issuer.admin()`.
CREATE POLICY community_bypass_policy ON "t_report_feedbacks"
  USING (NULLIF(current_setting('app.rls_bypass', true), 'off')::text = 'on');
