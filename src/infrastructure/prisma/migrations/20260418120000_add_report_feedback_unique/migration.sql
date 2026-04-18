-- Enforce one feedback per (report, user). Required by PR-F4's
-- `submitReportFeedback` mutation, which refuses second submits and
-- relies on the unique index both as an app-layer fast path (via a
-- pre-check) and as the last line of defence against racing writers.
--
-- Pre-existing duplicate rows would block this migration. t_report_feedbacks
-- had no expose-path in F1/F2/F3, so no production duplicates are expected;
-- if any environment somehow accumulated them, resolve the duplicates
-- manually before re-running this migration — an automated dedupe here would
-- silently discard ratings, which is worse than a loud failure.
CREATE UNIQUE INDEX "t_report_feedbacks_report_id_user_id_key"
    ON "t_report_feedbacks"("report_id", "user_id");
