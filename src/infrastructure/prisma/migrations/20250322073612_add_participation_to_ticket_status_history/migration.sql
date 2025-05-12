-- AlterTable
ALTER TABLE "t_ticket_status_histories" ADD COLUMN     "participation_id" TEXT;

-- AddForeignKey
ALTER TABLE "t_ticket_status_histories" ADD CONSTRAINT "t_ticket_status_histories_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "t_participations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
