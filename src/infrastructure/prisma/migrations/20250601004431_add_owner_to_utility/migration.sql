-- AlterTable
ALTER TABLE "t_utilities" ADD COLUMN     "owner_id" TEXT;

-- AddForeignKey
ALTER TABLE "t_utilities" ADD CONSTRAINT "t_utilities_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
