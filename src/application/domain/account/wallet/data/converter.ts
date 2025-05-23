import { GqlWalletFilterInput, GqlWalletSortInput } from "@/types/graphql";
import { Prisma, WalletType } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class WalletConverter {
  filter(filter?: GqlWalletFilterInput): Prisma.WalletWhereInput {
    return {
      AND: [
        filter?.communityId ? { communityId: filter?.communityId } : {},
        filter?.userId ? { userId: filter?.userId } : {},
        filter?.type ? { type: filter?.type } : {},
      ],
    };
  }

  sort(sort?: GqlWalletSortInput): Prisma.WalletOrderByWithRelationInput[] {
    return [{ createdAt: sort?.createdAt ?? Prisma.SortOrder.desc }];
  }

  createCommunityWallet(params: CommunityWalletCreationParams): Prisma.WalletCreateInput {
    return {
      type: WalletType.COMMUNITY,
      community: { connect: { id: params.communityId } },
    };
  }

  createMemberWallet(params: MemberWalletCreationParams): Prisma.WalletCreateInput {
    return {
      type: WalletType.MEMBER,
      community: { connect: { id: params.communityId } },
      user: { connect: { id: params.userId } },
    };
  }
}

type CommunityWalletCreationParams = {
  communityId: string;
};

type MemberWalletCreationParams = {
  communityId: string;
  userId: string;
};
