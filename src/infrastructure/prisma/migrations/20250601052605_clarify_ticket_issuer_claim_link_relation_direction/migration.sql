/*
  Warnings:

  - You are about to drop the column `claim_link_id` on the `t_ticket_issuers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "t_ticket_issuers_claim_link_id_key";

-- AlterTable
ALTER TABLE "t_ticket_issuers" DROP COLUMN "claim_link_id";
