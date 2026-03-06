-- DropForeignKey
ALTER TABLE "t_community_firebase_configs" DROP CONSTRAINT IF EXISTS "t_community_firebase_configs_config_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "t_community_firebase_configs";
