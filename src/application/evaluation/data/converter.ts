import { GqlEvaluationFilterInput, GqlEvaluationSortInput } from "@/types/graphql";
import { EvaluationStatus, Prisma } from "@prisma/client";

export default class EvaluationConverter {
  static filter(filter?: GqlEvaluationFilterInput): Prisma.EvaluationWhereInput {
    const conditions: Prisma.EvaluationWhereInput[] = [];

    if (!filter) return {};

    if (filter.status) conditions.push({ status: filter.status });
    if (filter.evaluatorId) conditions.push({ evaluatorId: filter.evaluatorId });
    if (filter.participationId) conditions.push({ participationId: filter.participationId });

    return conditions.length ? { AND: conditions } : {};
  }

  static sort(sort?: GqlEvaluationSortInput): Prisma.EvaluationOrderByWithRelationInput[] {
    return [
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
      ...(sort?.updatedAt ? [{ updatedAt: sort.updatedAt }] : []),
    ];
  }

  static create(
    participationId: string,
    currentUserId: string,
    status: EvaluationStatus,
    comment?: string,
  ): Prisma.EvaluationCreateInput {
    return {
      participation: { connect: { id: participationId } },
      evaluator: { connect: { id: currentUserId } },
      status,
      comment,
      histories: {
        create: {
          status,
          comment,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }
}
