-- CreateTable
CREATE TABLE "t_nft_mints" (
    "id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "tx_hash" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_nft_mints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_mints_policy_id_asset_name_key" ON "t_nft_mints"("policy_id", "asset_name");
