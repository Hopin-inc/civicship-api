/*
  Warnings:

  - You are about to drop the column `hostingStatus` on the `t_opportunity_slots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "t_opportunity_slots" DROP COLUMN "hostingStatus",
ADD COLUMN     "hosting_status" "OpportunitySlotHostingStatus" NOT NULL DEFAULT 'SCHEDULED';

-- CreateMaterializedView
CREATE MATERIALIZED VIEW mv_earliest_reservable_slot AS
SELECT
    o.id AS opportunity_id,
    MIN(s.starts_at) AS earliest_reservable_date
FROM t_opportunities o
         JOIN t_opportunity_slots s ON s.opportunity_id = o.id
         LEFT JOIN mv_slot_remaining_capacity r ON r.slot_id = s.id
WHERE
    s.hosting_status = 'SCHEDULED'
  AND s.starts_at > now()
  AND (r.remaining_capacity IS NULL OR r.remaining_capacity > 0)
GROUP BY o.id;