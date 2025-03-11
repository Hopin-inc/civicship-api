import { GqlWalletFilterInput, GqlWalletSortInput } from "@/types/graphql";
import { Prisma, WalletType } from "@prisma/client";

export default class WalletConverter {
  static filter(filter?: GqlWalletFilterInput): Prisma.WalletWhereInput {
    return {
      AND: [
        filter?.communityId ? { communityId: filter?.communityId } : {},
        filter?.userId ? { userId: filter?.userId } : {},
        filter?.type ? { type: filter?.type } : {},
      ],
    };
  }

  static sort(sort?: GqlWalletSortInput): Prisma.WalletOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  static createCommunityWallet(input: GqlWalletCreateToCommunityInput): Prisma.WalletCreateInput {
    return {
      type: WalletType.COMMUNITY,
      community: { connect: { id: input.communityId } },
    };
  }

  static createMemberWallet(input: GqlWalletCreateToMemberInput): Prisma.WalletCreateInput {
    return {
      type: WalletType.MEMBER,
      community: { connect: { id: input.communityId } },
      user: { connect: { id: input.userId } },
    };
  }
}
