/*
  Warnings:

  - You are about to alter the column `state_country_code` on the `t_communities` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to alter the column `state_country_code` on the `t_opportunities` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.

*/
-- DropForeignKey
ALTER TABLE "t_communities" DROP CONSTRAINT "t_communities_state_code_state_country_code_fkey";

-- DropForeignKey
ALTER TABLE "t_opportunities" DROP CONSTRAINT "t_opportunities_state_code_state_country_code_fkey";

-- AlterTable
ALTER TABLE "t_communities" ALTER COLUMN "state_code" DROP NOT NULL,
ALTER COLUMN "state_country_code" DROP NOT NULL,
ALTER COLUMN "state_country_code" SET DATA TYPE CHAR(2);

-- AlterTable
ALTER TABLE "t_opportunities" ALTER COLUMN "state_code" DROP NOT NULL,
ALTER COLUMN "state_country_code" DROP NOT NULL,
ALTER COLUMN "state_country_code" SET DATA TYPE CHAR(2);

-- AlterTable
ALTER TABLE "t_transactions" ALTER COLUMN "from_point_change" DROP NOT NULL,
ALTER COLUMN "to_point_change" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "t_communities" ADD CONSTRAINT "t_communities_state_code_state_country_code_fkey" FOREIGN KEY ("state_code", "state_country_code") REFERENCES "m_states"("code", "country_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_opportunities" ADD CONSTRAINT "t_opportunities_state_code_state_country_code_fkey" FOREIGN KEY ("state_code", "state_country_code") REFERENCES "m_states"("code", "country_code") ON DELETE SET NULL ON UPDATE CASCADE;
