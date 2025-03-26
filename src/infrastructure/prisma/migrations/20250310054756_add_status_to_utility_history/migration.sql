/*
  Warnings:

  - The values [UTILITY_REDEEMED,MEMBERSHIP_DELETED] on the enum `TransactionReason` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `t_opportunity_required_utilities` table. All the data in the column will be lost.
  - You are about to drop the column `used_at` on the `t_utility_histories` table. All the data in the column will be lost.
  - Made the column `from_point_change` on table `t_transactions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `to_point_change` on table `t_transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UtilityStatus" AS ENUM ('PURCHASED', 'USED', 'REFUNDED');

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionReason_new" AS ENUM ('POINT_ISSUED', 'POINT_REWARD', 'DONATION', 'GRANT', 'UTILITY_PURCHASED', 'UTILITY_USED', 'UTILITY_REFUNDED');
ALTER TABLE "t_transactions" ALTER COLUMN "reason" TYPE "TransactionReason_new" USING ("reason"::text::"TransactionReason_new");
ALTER TYPE "TransactionReason" RENAME TO "TransactionReason_old";
ALTER TYPE "TransactionReason_new" RENAME TO "TransactionReason";
DROP TYPE "TransactionReason_old";
COMMIT;

-- AlterTable
ALTER TABLE "t_opportunity_required_utilities" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "t_transactions" ALTER COLUMN "from_point_change" SET NOT NULL,
ALTER COLUMN "to_point_change" SET NOT NULL;

-- AlterTable
ALTER TABLE "t_utility_histories" DROP COLUMN "used_at",
ADD COLUMN     "status" "UtilityStatus" NOT NULL DEFAULT 'PURCHASED';

-- DropEnum
DROP TYPE "OpportunityUtilityStatus";
