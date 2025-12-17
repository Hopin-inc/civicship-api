-- CreateTable
CREATE TABLE "t_nft_tokens" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT,
    "symbol" TEXT,
    "type" TEXT NOT NULL,
    "json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_nft_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_nft_instances" (
    "id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "image_url" TEXT,
    "json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "nft_wallet_id" TEXT NOT NULL,
    "nft_token_id" TEXT,

    CONSTRAINT "t_nft_instances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_tokens_address_key" ON "t_nft_tokens"("address");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_instances_nft_wallet_id_instance_id_key" ON "t_nft_instances"("nft_wallet_id", "instance_id");

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_nft_wallet_id_fkey" FOREIGN KEY ("nft_wallet_id") REFERENCES "t_nft_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_nft_instances" ADD CONSTRAINT "t_nft_instances_nft_token_id_fkey" FOREIGN KEY ("nft_token_id") REFERENCES "t_nft_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;
