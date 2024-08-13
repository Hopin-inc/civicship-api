-- AlterTable
ALTER TABLE `t_users` ADD COLUMN `sys_role` ENUM('SYS_ADMIN', 'USER') NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE `t_users_on_groups` ADD COLUMN `role` ENUM('OWNER', 'MANAGER', 'MEMBER') NULL;

-- AlterTable
ALTER TABLE `t_users_on_organizations` ADD COLUMN `role` ENUM('OWNER', 'MANAGER', 'MEMBER') NOT NULL DEFAULT 'MEMBER';
