-- AlterTable
ALTER TABLE "t_community_configs" ALTER COLUMN "community_id" DROP NOT NULL;

-- DropForeignKey (to allow null values)
ALTER TABLE "t_community_configs" DROP CONSTRAINT IF EXISTS "t_community_configs_community_id_fkey";

-- AddForeignKey (with optional relation)
ALTER TABLE "t_community_configs" ADD CONSTRAINT "t_community_configs_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
