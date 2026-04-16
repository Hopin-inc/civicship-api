import { GqlNftTokenFilterInput, GqlNftTokenSortInput, GqlSortDirection } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class NftTokenConverter {
  filter(input?: GqlNftTokenFilterInput): Prisma.NftTokenWhereInput {
    if (!input) return {};

    const conditions: Prisma.NftTokenWhereInput[] = [];

    if (input.address?.length) {
      conditions.push({ address: { in: input.address } });
    }

    if (input.type?.length) {
      conditions.push({ type: { in: input.type } });
    }

    // 「このコミュニティに NftInstance が1件以上存在する」トークンに絞る。
    // NftToken 自体は community に紐付かないため、nftInstances.some を経由する。
    if (input.communityId !== undefined && input.communityId !== null) {
      conditions.push({
        nftInstances: {
          some: { communityId: input.communityId },
        },
      });
    }

    const allAndConditions: Prisma.NftTokenWhereInput[] = [...conditions];

    if (input.and?.length) {
      allAndConditions.push(...input.and.map((f) => this.filter(f)));
    }

    const where: Prisma.NftTokenWhereInput = {};

    if (allAndConditions.length > 0) {
      where.AND = allAndConditions;
    }

    if (input.or?.length) {
      where.OR = input.or.map((f) => this.filter(f));
    }

    if (input.not) {
      where.NOT = this.filter(input.not);
    }

    return where;
  }

  sort(input?: GqlNftTokenSortInput): Prisma.NftTokenOrderByWithRelationInput[] {
    const orderBy: Prisma.NftTokenOrderByWithRelationInput[] = [];

    if (input?.createdAt) {
      orderBy.push({ createdAt: input.createdAt === GqlSortDirection.Asc ? "asc" : "desc" });
    }

    if (input?.name) {
      orderBy.push({ name: input.name === GqlSortDirection.Asc ? "asc" : "desc" });
    }

    if (input?.address) {
      orderBy.push({ address: input.address === GqlSortDirection.Asc ? "asc" : "desc" });
    }

    orderBy.push({ id: "asc" });

    return orderBy.length > 1 ? orderBy : [{ createdAt: "desc" }, { id: "asc" }];
  }
}
