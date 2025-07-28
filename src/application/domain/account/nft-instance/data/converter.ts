import { GqlNftInstanceFilterInput, GqlNftInstanceSortInput, GqlSortDirection } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class NftInstanceConverter {
  nftInstancesFilter(input?: GqlNftInstanceFilterInput): Prisma.NftInstanceWhereInput {
    if (!input) return {};

    const conditions: Prisma.NftInstanceWhereInput[] = [];

    if (input.userId?.length) {
      conditions.push({ nftWallet: { userId: { in: input.userId } } });
    }

    if (input.nftWalletId?.length) {
      conditions.push({ nftWalletId: { in: input.nftWalletId } });
    }

    if (input.nftTokenAddress?.length) {
      conditions.push({ nftToken: { address: { in: input.nftTokenAddress } } });
    }

    if (input.nftTokenType?.length) {
      conditions.push({ nftToken: { type: { in: input.nftTokenType } } });
    }

    if (input.hasName !== undefined) {
      conditions.push(input.hasName ? { name: { not: null } } : { name: null });
    }

    if (input.hasDescription !== undefined) {
      conditions.push(input.hasDescription ? { description: { not: null } } : { description: null });
    }

    if (input.hasImage !== undefined) {
      conditions.push(input.hasImage ? { imageUrl: { not: null } } : { imageUrl: null });
    }

    const allAndConditions: Prisma.NftInstanceWhereInput[] = [...conditions];

    if (input.and?.length) {
      const andConditions = input.and.map(filter => this.nftInstancesFilter(filter));
      allAndConditions.push(...andConditions);
    }

    const where: Prisma.NftInstanceWhereInput = {};

    if (allAndConditions.length > 0) {
      where.AND = allAndConditions;
    }

    if (input.or?.length) {
      where.OR = input.or.map(filter => this.nftInstancesFilter(filter));
    }

    if (input.not) {
      where.NOT = this.nftInstancesFilter(input.not);
    }

    return where;
  }

  nftInstancesSort(input?: GqlNftInstanceSortInput): Prisma.NftInstanceOrderByWithRelationInput[] {
    const orderBy: Prisma.NftInstanceOrderByWithRelationInput[] = [];

    if (input?.createdAt) {
      orderBy.push({ createdAt: input.createdAt === GqlSortDirection.Asc ? "asc" : "desc" });
    }

    if (input?.name) {
      orderBy.push({ name: input.name === GqlSortDirection.Asc ? "asc" : "desc" });
    }

    if (input?.instanceId) {
      orderBy.push({ instanceId: input.instanceId === GqlSortDirection.Asc ? "asc" : "desc" });
    }

    orderBy.push({ id: "asc" });

    return orderBy.length > 1 ? orderBy : [{ createdAt: "desc" }, { id: "asc" }];
  }
}
