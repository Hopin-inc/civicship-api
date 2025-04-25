import { GqlEvaluationHistoryFilterInput, GqlEvaluationHistorySortInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class EvaluationHistoryConverter {
  static filter(filter?: GqlEvaluationHistoryFilterInput): Prisma.EvaluationHistoryWhereInput {
    const conditions: Prisma.EvaluationHistoryWhereInput[] = [];

    if (!filter) return {};

    if (filter.status) conditions.push({ status: filter.status });
    if (filter.evaluationId) conditions.push({ evaluationId: filter.evaluationId });
    if (filter.createdByUserId) conditions.push({ createdBy: filter.createdByUserId });

    return conditions.length ? { AND: conditions } : {};
  }

  static sort(
    sort?: GqlEvaluationHistorySortInput,
  ): Prisma.EvaluationHistoryOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }
}
