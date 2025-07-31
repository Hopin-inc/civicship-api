SET app.rls_bypass = 'on';
SET app.rls_config.user_id = '';

-- AlterTable
ALTER TABLE "t_transactions" ADD COLUMN     "reservation_id" TEXT;

-- AddForeignKey
ALTER TABLE "t_transactions" ADD CONSTRAINT "t_transactions_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "t_reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
