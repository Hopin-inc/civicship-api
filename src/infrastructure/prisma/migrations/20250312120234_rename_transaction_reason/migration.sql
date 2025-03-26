/*
  Warnings:

  - The values [UTILITY_PURCHASED,UTILITY_REFUNDED] on the enum `TransactionReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionReason_new" AS ENUM ('POINT_ISSUED', 'POINT_REWARD', 'DONATION', 'GRANT', 'TICKET_PURCHASED', 'TICKET_REFUNDED');
ALTER TABLE "t_transactions" ALTER COLUMN "reason" TYPE "TransactionReason_new" USING ("reason"::text::"TransactionReason_new");
ALTER TYPE "TransactionReason" RENAME TO "TransactionReason_old";
ALTER TYPE "TransactionReason_new" RENAME TO "TransactionReason";
DROP TYPE "TransactionReason_old";
COMMIT;
