import {
  GqlUtilityHistoryFilterInput,
  GqlUtilityHistorySortInput,
  GqlUtilityHistoryCreateInput,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class UtilityHistoryInputFormat {
  static filter(filter?: GqlUtilityHistoryFilterInput): Prisma.UtilityHistoryWhereInput {
    return {
      AND: [
        filter?.walletId ? { walletId: filter.walletId } : {},
        filter?.utilityId ? { utilityId: filter.utilityId } : {},
        filter?.status ? { status: filter?.status } : {},
      ],
    };
  }

  static sort(sort?: GqlUtilityHistorySortInput): Prisma.UtilityHistoryOrderByWithRelationInput[] {
    return [
      {
        createdAt: sort?.createdAt ?? Prisma.SortOrder.desc,
      },
    ];
  }

  static create(input: GqlUtilityHistoryCreateInput): Prisma.UtilityHistoryCreateInput {
    return {
      status: input.status,
      wallet: { connect: { id: input.walletId } },
      utility: { connect: { id: input.utilityId } },
      transaction: { connect: { id: input.transactionId } },
    };
  }
}
