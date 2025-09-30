/*
  Warnings:

  - A unique constraint covering the columns `[order_item_id]` on the table `t_nft_mints` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "t_nft_mints" ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "t_stripe_events" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "order_id" TEXT,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_stripe_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_stripe_events_event_id_key" ON "t_stripe_events"("event_id");

-- CreateIndex
CREATE INDEX "t_stripe_events_event_id_idx" ON "t_stripe_events"("event_id");

-- CreateIndex
CREATE INDEX "t_stripe_events_order_id_idx" ON "t_stripe_events"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_mints_order_item_id_key" ON "t_nft_mints"("order_item_id");

-- CreateIndex
CREATE INDEX "t_nft_mints_status_created_at_idx" ON "t_nft_mints"("status", "created_at");
