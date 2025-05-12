/*
  Warnings:

  - The values [PERSONAL_LOG] on the enum `Todo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Todo_new" AS ENUM ('PROFILE', 'PERSONAL_RECORD', 'FIRST_ACTIVITY', 'FIRST_QUEST');
ALTER TABLE "t_onboardings" ALTER COLUMN "todo" DROP DEFAULT;
ALTER TABLE "t_onboardings" ALTER COLUMN "todo" TYPE "Todo_new" USING ("todo"::text::"Todo_new");
ALTER TYPE "Todo" RENAME TO "Todo_old";
ALTER TYPE "Todo_new" RENAME TO "Todo";
DROP TYPE "Todo_old";
ALTER TABLE "t_onboardings" ALTER COLUMN "todo" SET DEFAULT 'PROFILE';
COMMIT;
