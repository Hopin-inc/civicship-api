-- CreateView
CREATE VIEW `v_activities_stats` (
    `id`,
    `is_public`,
    `starts_at`,
    `ends_at`,
    `user_id`,
    `event_id`,
    `total_minutes`
) AS (
    SELECT
        `id`,
        `is_public`,
        `starts_at`,
        `ends_at`,
        `user_id`,
        `event_id`,
        TIMESTAMPDIFF(MINUTE, `starts_at`, `ends_at`)
    FROM `t_activities`
);

-- CreateView
CREATE VIEW `v_events_stats` (
    `id`,
    `is_public`,
    `starts_at`,
    `ends_at`,
    `planned_starts_at`,
    `planned_ends_at`,
    `total_minutes`
) AS (
    SELECT
        `e`.`id`,
        `e`.`is_public`,
        `e`.`starts_at`,
        `e`.`ends_at`,
        `e`.`planned_starts_at`,
        `e`.`planned_ends_at`,
        SUM(`as`.`total_minutes`)
    FROM `t_events` AS `e`
    LEFT JOIN `v_activities_stats` AS `as` ON `e`.`id` = `as`.`event_id`
    GROUP BY `e`.`id`
);
