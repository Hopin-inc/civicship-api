/*
  Warnings:

  - A unique constraint covering the columns `[evaluation_id]` on the table `t_vc_issuance_requests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `evaluation_id` to the `t_vc_issuance_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "t_vc_issuance_requests" ADD COLUMN     "evaluation_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "t_vc_issuance_requests_evaluation_id_key" ON "t_vc_issuance_requests"("evaluation_id");

-- AddForeignKey
ALTER TABLE "t_vc_issuance_requests" ADD CONSTRAINT "t_vc_issuance_requests_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "t_evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
