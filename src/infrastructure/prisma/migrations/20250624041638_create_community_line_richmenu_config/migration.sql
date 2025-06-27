-- CreateEnum
CREATE TYPE "LineRichMenuType" AS ENUM ('ADMIN', 'USER', 'PUBLIC');

-- CreateTable
CREATE TABLE "t_community_line_rich_menus" (
    "id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "type" "LineRichMenuType" NOT NULL,
    "rich_menu_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "t_community_line_rich_menus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_community_line_rich_menus_config_id_type_key" ON "t_community_line_rich_menus"("config_id", "type");

-- AddForeignKey
ALTER TABLE "t_community_line_rich_menus" ADD CONSTRAINT "t_community_line_rich_menus_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "t_community_line_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
