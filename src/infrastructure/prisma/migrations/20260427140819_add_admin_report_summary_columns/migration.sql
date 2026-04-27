-- Phase 2 (依頼 3a + 3b): admin 横断レポート観察用の index と denormalize 列を追加。
-- - t_reports に publishedAt DESC, createdAt DESC の複合 index を追加
--   (adminBrowseReports が community 横断で publishedAt 順にスキャンするため)
-- - t_communities に last_published_report_at / last_published_report_id 列を追加
--   (adminReportSummary の cursor pagination + sort 用、内部 denormalize)
-- - 列追加後、既存 PUBLISHED レポートから値を backfill

-- AlterTable
ALTER TABLE "t_communities"
  ADD COLUMN "last_published_report_at" TIMESTAMP(3),
  ADD COLUMN "last_published_report_id" TEXT;

-- CreateIndex
-- NULLS LAST aligns the index ordering with adminBrowseReports'
-- `publishedAt DESC NULLS LAST, createdAt DESC` so the planner can
-- satisfy the sort directly from the index (PG default for DESC is
-- NULLS FIRST, which would force a re-sort).
CREATE INDEX "idx_t_reports_published_at_created_at"
  ON "t_reports"("published_at" DESC NULLS LAST, "created_at" DESC);

-- CreateIndex
-- NULLS FIRST aligns the index ordering with adminReportSummary's
-- dormant-first sort `last_published_report_at ASC NULLS FIRST` —
-- PG default for ASC is NULLS LAST, so an unqualified index would
-- not be usable for the L1 dashboard's primary sort path.
CREATE INDEX "idx_t_communities_last_published_report_at"
  ON "t_communities"("last_published_report_at" ASC NULLS FIRST);

-- Backfill: 各 community で status=PUBLISHED の最新レポートを引き、新規列に流し込む。
-- DISTINCT ON で per-community に 1 行だけ抽出する Postgres 流の書き方。
-- "id" DESC は per-community での ties (同 ms バッチ publish) に対する
-- tie-breaker。recalculateCommunityLastPublished 側の SELECT と同じ
-- 順序にすることで「migration 適用直後の state == 任意の publish 後の
-- state」になり、追加の reconciliation を考えなくてよい。
UPDATE "t_communities" c
SET
  "last_published_report_at" = sub."max_published_at",
  "last_published_report_id" = sub."report_id"
FROM (
  SELECT DISTINCT ON ("community_id")
    "community_id",
    "id" AS "report_id",
    "published_at" AS "max_published_at"
  FROM "t_reports"
  WHERE "status" = 'PUBLISHED' AND "published_at" IS NOT NULL
  ORDER BY "community_id", "published_at" DESC, "id" DESC
) sub
WHERE c."id" = sub."community_id";
