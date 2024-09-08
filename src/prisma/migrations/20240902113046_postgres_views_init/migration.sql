-- CreateFunction
CREATE OR REPLACE FUNCTION DateDiff (units VARCHAR(30), start_t TIMESTAMP, end_t TIMESTAMP)
    RETURNS INT AS
$$
DECLARE
    diff_interval INTERVAL;
    diff INT = 0;
    years_diff INT = 0;
BEGIN
    IF units IN ('yy', 'yyyy', 'year', 'mm', 'm', 'month') THEN
        years_diff = DATE_PART('year', end_t) - DATE_PART('year', start_t);

        IF units IN ('yy', 'yyyy', 'year') THEN
            -- SQL Server does not count full years passed (only difference between year parts)
            RETURN years_diff;
        ELSE
            -- If end month is less than start month it will subtracted
            RETURN years_diff * 12 + (DATE_PART('month', end_t) - DATE_PART('month', start_t));
        END IF;
    END IF;

    -- Minus operator returns interval 'DDD days HH:MI:SS'
    diff_interval = end_t - start_t;

    diff = diff + DATE_PART('day', diff_interval);

    IF units IN ('wk', 'ww', 'week') THEN
        diff = diff/7;
        RETURN diff;
    END IF;

    IF units IN ('dd', 'd', 'day') THEN
        RETURN diff;
    END IF;

    diff = diff * 24 + DATE_PART('hour', diff_interval);

    IF units IN ('hh', 'hour') THEN
        RETURN diff;
    END IF;

    diff = diff * 60 + DATE_PART('minute', diff_interval);

    IF units IN ('mi', 'n', 'minute') THEN
        RETURN diff;
    END IF;

    diff = diff * 60 + DATE_PART('second', diff_interval);

    RETURN diff;
END;
$$ LANGUAGE plpgsql;

-- CreateMaterializedView
CREATE MATERIALIZED VIEW "mv_activities_stats" (
    "id",
    "is_public",
    "starts_at",
    "ends_at",
    "user_id",
    "event_id",
    "issue_id",
    "total_minutes"
) AS (
    SELECT
        "id",
        "is_public",
        "starts_at",
        "ends_at",
        "user_id",
        "event_id",
        "issue_id",
        DateDiff('minute', "starts_at", "ends_at")
    FROM "t_activities"
);
CREATE UNIQUE INDEX "mv_activities_stats_id_idx" ON "mv_activities_stats" ("id");

-- CreateMaterializedView
CREATE MATERIALIZED VIEW "mv_issues_stats" (
    "id",
    "is_public",
    "total_minutes"
) AS (
    SELECT
        "i"."id",
        "i"."is_public",
        sum("as"."total_minutes")
    FROM "t_issues" AS "i"
    LEFT JOIN "mv_activities_stats" AS "as" ON "i"."id" = "as"."issue_id"
    GROUP BY "i"."id"
);
CREATE UNIQUE INDEX "mv_issues_stats_id_idx" ON "mv_issues_stats" ("id");

-- CreateMaterializedView
CREATE MATERIALIZED VIEW "mv_events_stats" (
    "id",
    "is_public",
    "starts_at",
    "ends_at",
    "planned_starts_at",
    "planned_ends_at",
    "total_minutes"
) AS (
    SELECT
        "e"."id",
        "e"."is_public",
        "e"."starts_at",
        "e"."ends_at",
        "e"."planned_starts_at",
        "e"."planned_ends_at",
        SUM("as"."total_minutes")
    FROM "t_events" AS "e"
    LEFT JOIN "mv_activities_stats" AS "as" ON "e"."id" = "as"."event_id"
    GROUP BY "e"."id"
);
CREATE UNIQUE INDEX "mv_events_stats_id_idx" ON "mv_events_stats" ("id");
