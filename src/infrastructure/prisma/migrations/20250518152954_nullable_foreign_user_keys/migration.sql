-- AlterTable
ALTER TABLE "t_evaluations" ALTER COLUMN "evaluator_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "t_opportunities" ALTER COLUMN "created_by" DROP NOT NULL;
