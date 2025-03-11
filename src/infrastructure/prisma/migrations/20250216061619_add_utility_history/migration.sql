/*
  Warnings:

  - You are about to drop the column `utility_id` on the `t_transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "t_transactions" DROP CONSTRAINT "t_transactions_utility_id_fkey";

-- AlterTable
ALTER TABLE "t_transactions" DROP COLUMN "utility_id";

-- CreateTable
CREATE TABLE "t_utility_histories" (
    "id" TEXT NOT NULL,
    "used_at" TIMESTAMP(3),
    "wallet_id" TEXT NOT NULL,
    "utility_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_utility_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "t_utility_histories" ADD CONSTRAINT "t_utility_histories_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "t_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_utility_histories" ADD CONSTRAINT "t_utility_histories_utility_id_fkey" FOREIGN KEY ("utility_id") REFERENCES "t_utilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_utility_histories" ADD CONSTRAINT "t_utility_histories_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "t_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
