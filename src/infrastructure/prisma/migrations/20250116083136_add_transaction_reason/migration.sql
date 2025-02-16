/*
  Warnings:

  - Added the required column `reason` to the `t_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "t_memberships" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "t_transactions" ADD COLUMN     "reason" "TransactionReason" NOT NULL;
