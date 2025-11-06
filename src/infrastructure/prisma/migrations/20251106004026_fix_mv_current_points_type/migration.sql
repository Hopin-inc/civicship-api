DROP MATERIALIZED VIEW IF EXISTS "mv_current_points";

CREATE MATERIALIZED VIEW "mv_current_points" AS
SELECT
    "wallet_id",
    COALESCE(SUM("current_point"), 0)::bigint AS "current_point"
FROM (
    SELECT
        "from" AS "wallet_id",
        - "from_point_change" AS "current_point"
    FROM "t_transactions"
    WHERE "from" IS NOT NULL
    UNION ALL
    SELECT
        "to" AS "wallet_id",
        "to_point_change" AS "current_point"
    FROM "t_transactions"
    WHERE "to" IS NOT NULL
) AS "point_changes"
GROUP BY "wallet_id";

CREATE UNIQUE INDEX "mv_current_points_unique_id" ON "mv_current_points" ("wallet_id");
