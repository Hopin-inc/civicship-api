/*
  Warnings:

  - You are about to drop the column `type` on the `t_utilities` table. All the data in the column will be lost.
  - You are about to drop the `t_opportunity_required_utilities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_utility_histories` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('AVAILABLE', 'DISABLED');

-- CreateEnum
CREATE TYPE "TicketStatusReason" AS ENUM ('PURCHASED', 'CANCELED', 'RESERVED', 'USED', 'REFUNDED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "t_opportunity_required_utilities" DROP CONSTRAINT "t_opportunity_required_utilities_opportunity_id_fkey";

-- DropForeignKey
ALTER TABLE "t_opportunity_required_utilities" DROP CONSTRAINT "t_opportunity_required_utilities_utility_id_fkey";

-- DropForeignKey
ALTER TABLE "t_utility_histories" DROP CONSTRAINT "t_utility_histories_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "t_utility_histories" DROP CONSTRAINT "t_utility_histories_utility_id_fkey";

-- DropForeignKey
ALTER TABLE "t_utility_histories" DROP CONSTRAINT "t_utility_histories_wallet_id_fkey";

-- AlterTable
ALTER TABLE "t_utilities" DROP COLUMN "type",
ADD COLUMN     "publish_status" "PublishStatus" NOT NULL DEFAULT 'PUBLIC';

-- DropTable
DROP TABLE "t_opportunity_required_utilities";

-- DropTable
DROP TABLE "t_utility_histories";

-- DropEnum
DROP TYPE "UtilityStatus";

-- DropEnum
DROP TYPE "UtilityType";

-- CreateTable
CREATE TABLE "t_tickets" (
    "id" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'AVAILABLE',
    "wallet_id" TEXT NOT NULL,
    "utility_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_ticket_status_histories" (
    "id" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'AVAILABLE',
    "reason" "TicketStatusReason" NOT NULL DEFAULT 'PURCHASED',
    "ticket_id" TEXT NOT NULL,
    "created_by" TEXT,
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_ticket_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OpportunityToUtility" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OpportunityToUtility_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_ticket_status_histories_transaction_id_key" ON "t_ticket_status_histories"("transaction_id");

-- CreateIndex
CREATE INDEX "_OpportunityToUtility_B_index" ON "_OpportunityToUtility"("B");

-- AddForeignKey
ALTER TABLE "t_tickets" ADD CONSTRAINT "t_tickets_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "t_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_tickets" ADD CONSTRAINT "t_tickets_utility_id_fkey" FOREIGN KEY ("utility_id") REFERENCES "t_utilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_ticket_status_histories" ADD CONSTRAINT "t_ticket_status_histories_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "t_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_ticket_status_histories" ADD CONSTRAINT "t_ticket_status_histories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "t_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_ticket_status_histories" ADD CONSTRAINT "t_ticket_status_histories_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "t_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OpportunityToUtility" ADD CONSTRAINT "_OpportunityToUtility_A_fkey" FOREIGN KEY ("A") REFERENCES "t_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OpportunityToUtility" ADD CONSTRAINT "_OpportunityToUtility_B_fkey" FOREIGN KEY ("B") REFERENCES "t_utilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
