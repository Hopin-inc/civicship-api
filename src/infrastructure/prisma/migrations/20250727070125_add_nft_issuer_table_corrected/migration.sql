-- CreateTable
CREATE TABLE "t_nft_issuers" (
    "address" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_nft_issuers_pkey" PRIMARY KEY ("address")
);

-- AddForeignKey
ALTER TABLE "t_nft_tokens" ADD CONSTRAINT "t_nft_tokens_address_fkey" FOREIGN KEY ("address") REFERENCES "t_nft_issuers"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
