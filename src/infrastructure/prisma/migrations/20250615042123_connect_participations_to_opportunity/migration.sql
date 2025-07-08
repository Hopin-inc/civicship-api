-- AlterTable
ALTER TABLE "t_participations" ADD COLUMN     "opportunity_id" TEXT;

-- AddForeignKey
ALTER TABLE "t_participations" ADD CONSTRAINT "t_participations_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "t_opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
