-- DropRLS
ALTER TABLE "t_users" DISABLE ROW LEVEL SECURITY;

-- CreateMaterializedView
CREATE MATERIALIZED VIEW "mv_current_points" AS
SELECT
    "wallet_id",
    SUM("current_point") AS "current_point"
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
