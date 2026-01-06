-- CreateEnum
CREATE TYPE "IncentiveGrantType" AS ENUM ('SIGNUP');

-- CreateEnum
CREATE TYPE "IncentiveGrantStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "IncentiveGrantFailureCode" AS ENUM ('INSUFFICIENT_FUNDS', 'WALLET_NOT_FOUND', 'DATABASE_ERROR', 'TIMEOUT', 'UNKNOWN');

-- CreateTable
CREATE TABLE "t_community_signup_bonus_configs" (
    "id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "bonus_point" INTEGER NOT NULL DEFAULT 100,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_community_signup_bonus_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_incentive_grants" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "type" "IncentiveGrantType" NOT NULL,
    "source_id" TEXT NOT NULL,
    "status" "IncentiveGrantStatus" NOT NULL DEFAULT 'PENDING',
    "failure_code" "IncentiveGrantFailureCode",
    "last_error" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 1,
    "last_attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_incentive_grants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_community_signup_bonus_configs_community_id_key" ON "t_community_signup_bonus_configs"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_incentive_grants_transaction_id_key" ON "t_incentive_grants"("transaction_id");

-- CreateIndex
CREATE INDEX "t_incentive_grants_status_last_attempted_at_idx" ON "t_incentive_grants"("status", "last_attempted_at");

-- CreateIndex
CREATE UNIQUE INDEX "t_incentive_grants_user_id_community_id_type_source_id_key" ON "t_incentive_grants"("user_id", "community_id", "type", "source_id");

-- AddForeignKey
ALTER TABLE "t_community_signup_bonus_configs" ADD CONSTRAINT "t_community_signup_bonus_configs_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_incentive_grants" ADD CONSTRAINT "t_incentive_grants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_incentive_grants" ADD CONSTRAINT "t_incentive_grants_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_incentive_grants" ADD CONSTRAINT "t_incentive_grants_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "t_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
