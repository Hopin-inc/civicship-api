import { Prisma, IncentiveGrantType } from "@prisma/client";
import {
  GqlSignupBonusFilterInput,
  GqlSignupBonusSortInput,
  GqlSignupBonusSortField,
  GqlSortDirection,
} from "@/types/graphql";
import { injectable } from "tsyringe";

@injectable()
export default class IncentiveGrantConverter {
  filter(
    communityId: string,
    filter?: GqlSignupBonusFilterInput | null,
  ): Prisma.IncentiveGrantWhereInput {
    const where: Prisma.IncentiveGrantWhereInput = {
      communityId,
      type: IncentiveGrantType.SIGNUP,
    };

    if (!filter) return where;

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) {
        where.createdAt.gte = new Date(filter.dateFrom);
      }
      if (filter.dateTo) {
        where.createdAt.lte = new Date(filter.dateTo);
      }
    }

    return where;
  }

  sort(sort?: GqlSignupBonusSortInput | null): Prisma.IncentiveGrantOrderByWithRelationInput {
    if (!sort) {
      return { createdAt: Prisma.SortOrder.desc };
    }

    const order =
      sort.order === GqlSortDirection.Asc ? Prisma.SortOrder.asc : Prisma.SortOrder.desc;

    switch (sort.field) {
      case GqlSignupBonusSortField.CreatedAt:
        return { createdAt: order };
      case GqlSignupBonusSortField.LastAttemptedAt:
        return { lastAttemptedAt: order };
      case GqlSignupBonusSortField.AttemptCount:
        return { attemptCount: order };
      default:
        return { createdAt: Prisma.SortOrder.desc };
    }
  }
}
