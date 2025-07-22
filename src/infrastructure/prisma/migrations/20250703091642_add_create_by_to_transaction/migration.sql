SET app.rls_bypass = 'on';
SET app.rls_config.user_id = '';

-- AlterTable
ALTER TABLE "t_transactions" ADD COLUMN     "created_by" TEXT;

-- AddForeignKey
ALTER TABLE "t_transactions" ADD CONSTRAINT "t_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
