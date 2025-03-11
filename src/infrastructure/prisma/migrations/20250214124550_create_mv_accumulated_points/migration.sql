-- CreateMaterializedView
CREATE MATERIALIZED VIEW "mv_accumulated_points" AS
SELECT
    "to" AS "wallet_id",
    SUM("to_point_change") AS "accumulated_point"
FROM "t_transactions"
GROUP BY "wallet_id";
