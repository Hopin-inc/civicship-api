/*
  Warnings:

  - You are about to drop the `t_onboardings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "t_onboardings" DROP CONSTRAINT "t_onboardings_user_id_fkey";

-- DropTable
DROP TABLE "t_onboardings";

-- DropEnum
DROP TYPE "OnboardingStatus";

-- DropEnum
DROP TYPE "Todo";
