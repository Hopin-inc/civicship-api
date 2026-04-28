-- Phase 1.5 (依頼: adminTemplateFeedbacks query): individual feedback の
-- review-style 一覧 (template variant + version + kind 軸) を読むために、
-- t_report_feedbacks に (created_at DESC, id DESC) の複合 index を追加。
--
-- adminTemplateFeedbacks は Reports → ReportTemplate を join して
-- (variant, version, kind) で絞り込み、結果を created_at DESC, id DESC で
-- カーソル分割する。既存 index は (report_id) / (user_id) / (report_id,
-- user_id) のみで、cross-Report ソートを backing できず PostgreSQL は
-- 結果セット全体を materialize → sort してしまう。20件ページングであっても
-- このコストは template+ template 単位の運用ループで効いてくるため、
-- index でソートを直接 serve する。
--
-- id を 2 番目のキーに含めているのは cursor pagination の tie-breaker
-- 用 — created_at が同一の行 (seed 一括 INSERT / 高並列書き込み) があると
-- ページ間で並びがずれて重複 / 漏れが起きる。order by `(created_at DESC,
-- id DESC)` を index orderingで完全一致させる。

-- CreateIndex
CREATE INDEX "idx_t_report_feedbacks_created_at_id"
  ON "t_report_feedbacks"("created_at" DESC, "id" DESC);
