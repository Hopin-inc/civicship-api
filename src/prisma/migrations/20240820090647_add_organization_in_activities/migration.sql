-- DropForeignKey
ALTER TABLE `t_activities` DROP FOREIGN KEY `t_activities_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_comments` DROP FOREIGN KEY `t_comments_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_groups` DROP FOREIGN KEY `t_groups_organization_id_fkey`;

-- DropForeignKey
ALTER TABLE `t_likes` DROP FOREIGN KEY `t_likes_user_id_fkey`;

-- AlterTable
ALTER TABLE `t_activities` ADD COLUMN `organization_id` VARCHAR(191) NULL,
    MODIFY `user_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `t_comments` MODIFY `user_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `t_likes` MODIFY `user_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `t_groups` ADD CONSTRAINT `t_groups_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_activities` ADD CONSTRAINT `t_activities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_activities` ADD CONSTRAINT `t_activities_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `t_organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_likes` ADD CONSTRAINT `t_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `t_comments` ADD CONSTRAINT `t_comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
