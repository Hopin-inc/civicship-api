-- CreateTable
CREATE TABLE "t_community_configs" (
    "id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "firebase_config_id" TEXT NOT NULL,
    "line_config_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_community_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_firebase_config" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "t_firebase_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_line_config" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "channel_secret" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "liff_id" TEXT NOT NULL,
    "liff_base_url" TEXT NOT NULL,

    CONSTRAINT "t_line_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_community_configs_community_id_key" ON "t_community_configs"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_community_configs_firebase_config_id_key" ON "t_community_configs"("firebase_config_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_community_configs_line_config_id_key" ON "t_community_configs"("line_config_id");

-- AddForeignKey
ALTER TABLE "t_community_configs" ADD CONSTRAINT "t_community_configs_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "t_communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_community_configs" ADD CONSTRAINT "t_community_configs_firebase_config_id_fkey" FOREIGN KEY ("firebase_config_id") REFERENCES "t_firebase_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_community_configs" ADD CONSTRAINT "t_community_configs_line_config_id_fkey" FOREIGN KEY ("line_config_id") REFERENCES "t_line_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
