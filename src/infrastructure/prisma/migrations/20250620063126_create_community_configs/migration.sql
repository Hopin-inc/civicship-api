-- CreateTable
CREATE TABLE "t_community_configs" (
    "id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_community_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_community_firebase_configs" (
    "id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_community_firebase_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_community_line_configs" (
    "id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "channel_secret" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "liff_id" TEXT NOT NULL,
    "liff_base_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_community_line_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_community_configs_community_id_key" ON "t_community_configs"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_community_firebase_configs_config_id_key" ON "t_community_firebase_configs"("config_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_community_line_configs_config_id_key" ON "t_community_line_configs"("config_id");

-- AddForeignKey
ALTER TABLE "t_community_configs" ADD CONSTRAINT "t_community_configs_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_community_firebase_configs" ADD CONSTRAINT "t_community_firebase_configs_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "t_community_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_community_line_configs" ADD CONSTRAINT "t_community_line_configs_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "t_community_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
