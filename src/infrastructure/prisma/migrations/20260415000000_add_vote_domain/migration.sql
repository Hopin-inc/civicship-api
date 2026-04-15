-- CreateEnum
CREATE TYPE "vote_gate_type" AS ENUM ('NFT', 'MEMBERSHIP');

-- CreateEnum
CREATE TYPE "vote_power_policy_type" AS ENUM ('FLAT', 'NFT_COUNT');

-- CreateTable
CREATE TABLE "t_vote_gates" (
    "id" TEXT NOT NULL,
    "type" "vote_gate_type" NOT NULL,
    "nft_token_id" TEXT,
    "required_role" "Role",
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "t_vote_gates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_vote_power_policies" (
    "id" TEXT NOT NULL,
    "type" "vote_power_policy_type" NOT NULL,
    "nft_token_id" TEXT,
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "t_vote_power_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_vote_topics" (
    "id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_vote_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_vote_options" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "total_power" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "t_vote_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_vote_ballots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "power" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_vote_ballots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_vote_gates_topic_id_key" ON "t_vote_gates"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_vote_power_policies_topic_id_key" ON "t_vote_power_policies"("topic_id");

-- CreateIndex
CREATE INDEX "t_vote_topics_community_id_ends_at_idx" ON "t_vote_topics"("community_id", "ends_at");

-- CreateIndex
CREATE UNIQUE INDEX "t_vote_options_topic_id_order_index_key" ON "t_vote_options"("topic_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "t_vote_ballots_user_id_topic_id_key" ON "t_vote_ballots"("user_id", "topic_id");

-- AddForeignKey
ALTER TABLE "t_vote_gates" ADD CONSTRAINT "t_vote_gates_nft_token_id_fkey" FOREIGN KEY ("nft_token_id") REFERENCES "t_nft_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_vote_gates" ADD CONSTRAINT "t_vote_gates_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "t_vote_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_vote_power_policies" ADD CONSTRAINT "t_vote_power_policies_nft_token_id_fkey" FOREIGN KEY ("nft_token_id") REFERENCES "t_nft_tokens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_vote_power_policies" ADD CONSTRAINT "t_vote_power_policies_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "t_vote_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_vote_topics" ADD CONSTRAINT "t_vote_topics_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_vote_topics" ADD CONSTRAINT "t_vote_topics_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "t_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_vote_options" ADD CONSTRAINT "t_vote_options_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "t_vote_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_vote_ballots" ADD CONSTRAINT "t_vote_ballots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_vote_ballots" ADD CONSTRAINT "t_vote_ballots_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "t_vote_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_vote_ballots" ADD CONSTRAINT "t_vote_ballots_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "t_vote_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

