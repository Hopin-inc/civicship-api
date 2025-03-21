import { Prisma } from "@prisma/client";
import { userInclude } from "@/application/user/data/type";
import { participationInclude } from "@/application/participation/data/type";

export const evaluationInclude = Prisma.validator<Prisma.EvaluationInclude>()({
  evaluator: { include: userInclude },
  participation: { include: participationInclude },
});

export type PrismaEvaluation = Prisma.EvaluationGetPayload<{
  include: typeof evaluationInclude;
}>;
