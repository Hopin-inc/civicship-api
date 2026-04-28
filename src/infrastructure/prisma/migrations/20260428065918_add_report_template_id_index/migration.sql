-- Phase 1.5 (PR #936 review feedback): t_reports.template_id に index を追加。
--
-- adminTemplateFeedbacks / reportTemplateStatsBreakdown /
-- reportTemplateStats が走るクエリ経路は
-- `t_report_templates → t_reports (template_id) → t_report_feedbacks`
-- だが、t_reports 側に template_id 単独の index がなかったため、
-- template フィルタを先に効かせる plan を planner が選ぶと
-- t_reports を seq scan してしまう。現状のデータ量では問題ないが、
-- 線形にコストが増える + sysAdmin の prompt 調整ループで最もよく
-- 触られる query なので、規模が育つ前に index を入れて planner
-- regression を未然に防ぐ。
--
-- SetNull FK 制約は内部 btree を作るが、PG の planner は FK 制約由来の
-- index を非 FK 述語の plan には自動的に使わない (constraint は
-- referential integrity 用途、index hint としては expose されない)。
-- そのため明示的な index が必要。

-- CreateIndex
CREATE INDEX "idx_t_reports_template_id" ON "t_reports"("template_id");
