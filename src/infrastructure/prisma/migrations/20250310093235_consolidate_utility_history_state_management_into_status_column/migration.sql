/*
  Warnings:

  - You are about to drop the column `used_at` on the `t_utility_histories` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UtilityStatus" ADD VALUE 'RESERVED';
ALTER TYPE "UtilityStatus" ADD VALUE 'USED';

-- AlterTable
ALTER TABLE "t_utility_histories" DROP COLUMN "used_at",
ALTER COLUMN "transaction_id" DROP NOT NULL;
