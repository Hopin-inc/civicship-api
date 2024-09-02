-- CreateTable
CREATE TABLE `t_sessions` (
    `sid` VARCHAR(191) NOT NULL,
    `data` JSON NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`sid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_identities` (
    `uid` VARCHAR(191) NOT NULL,
    `platform` ENUM('LINE') NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`uid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `t_identities` ADD CONSTRAINT `t_identities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
