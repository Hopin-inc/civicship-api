-- CreateTable
CREATE TABLE "t_community_portal_configs" (
    "id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "token_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" TEXT,
    "domain" TEXT NOT NULL,
    "favicon_prefix" TEXT NOT NULL,
    "logo_path" TEXT NOT NULL,
    "square_logo_path" TEXT NOT NULL,
    "og_image_path" TEXT NOT NULL,
    "enable_features" JSONB NOT NULL,
    "root_path" TEXT NOT NULL DEFAULT '/',
    "admin_root_path" TEXT NOT NULL DEFAULT '/admin',
    "documents" JSONB,
    "common_document_overrides" JSONB,
    "region_name" TEXT,
    "region_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_community_portal_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_community_portal_configs_config_id_key" ON "t_community_portal_configs"("config_id");

-- AddForeignKey
ALTER TABLE "t_community_portal_configs" ADD CONSTRAINT "t_community_portal_configs_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "t_community_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
