-- CreateTable
CREATE TABLE "t_vendor_user_links" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "vendor" "NftVendor" NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_vendor_user_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_vendor_user_links_ref_key" ON "t_vendor_user_links"("ref");

-- CreateIndex
CREATE INDEX "t_vendor_user_links_user_id_idx" ON "t_vendor_user_links"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_vendor_user_links_vendor_user_id_key" ON "t_vendor_user_links"("vendor", "user_id");

-- AddForeignKey
ALTER TABLE "t_vendor_user_links" ADD CONSTRAINT "t_vendor_user_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "t_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
