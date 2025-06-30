-- CreateTable
CREATE TABLE "t_api_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_nft_wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_nft_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_api_keys_key_key" ON "t_api_keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "t_nft_wallets_user_id_key" ON "t_nft_wallets"("user_id");

-- AddForeignKey
ALTER TABLE "t_nft_wallets" ADD CONSTRAINT "t_nft_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
