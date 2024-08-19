/*
  Warnings:

  - A unique constraint covering the columns `[application_id]` on the table `t_activities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `t_activities_application_id_key` ON `t_activities`(`application_id`);
