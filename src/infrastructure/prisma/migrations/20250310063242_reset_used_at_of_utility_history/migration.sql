/*
  Warnings:

  - The values [UTILITY_USED] on the enum `TransactionReason` will be removed. If these variants are still used in the database, this will fail.
  - The values [USED] on the enum `UtilityStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `utility_type` on the `t_utilities` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionReason_new" AS ENUM ('POINT_ISSUED', 'POINT_REWARD', 'DONATION', 'GRANT', 'UTILITY_PURCHASED', 'UTILITY_REFUNDED');
ALTER TABLE "t_transactions" ALTER COLUMN "reason" TYPE "TransactionReason_new" USING ("reason"::text::"TransactionReason_new");
ALTER TYPE "TransactionReason" RENAME TO "TransactionReason_old";
ALTER TYPE "TransactionReason_new" RENAME TO "TransactionReason";
DROP TYPE "TransactionReason_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UtilityStatus_new" AS ENUM ('PURCHASED', 'REFUNDED');
ALTER TABLE "t_utility_histories" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "t_utility_histories" ALTER COLUMN "status" TYPE "UtilityStatus_new" USING ("status"::text::"UtilityStatus_new");
ALTER TYPE "UtilityStatus" RENAME TO "UtilityStatus_old";
ALTER TYPE "UtilityStatus_new" RENAME TO "UtilityStatus";
DROP TYPE "UtilityStatus_old";
ALTER TABLE "t_utility_histories" ALTER COLUMN "status" SET DEFAULT 'PURCHASED';
COMMIT;

-- AlterTable
ALTER TABLE "t_utilities" DROP COLUMN "utility_type",
ADD COLUMN     "type" "UtilityType" NOT NULL DEFAULT 'TICKET';

-- AlterTable
ALTER TABLE "t_utility_histories" ADD COLUMN     "used_at" TIMESTAMP(3);
