import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  PrismaMembership,
  PrismaMembershipDetail,
} from "@/application/domain/account/membership/data/type";

export interface IMembershipRepository {
  query(
    ctx: IContext,
    where: Prisma.MembershipWhereInput,
    orderBy: Prisma.MembershipOrderByWithRelationInput[],
    take: number,
    cursor?: Prisma.MembershipUserIdCommunityIdCompoundUniqueInput,
  ): Promise<PrismaMembershipDetail[]>;

  find(ctx: IContext, where: Prisma.MembershipWhereUniqueInput): Promise<PrismaMembership | null>;

  findDetail(
    ctx: IContext,
    where: Prisma.MembershipWhereUniqueInput,
  ): Promise<PrismaMembershipDetail | null>;

  create(
    ctx: IContext,
    data: Prisma.MembershipCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaMembership>;

  update(
    ctx: IContext,
    where: Prisma.MembershipWhereUniqueInput,
    data: Prisma.MembershipUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaMembership>;

  delete(
    ctx: IContext,
    where: Prisma.MembershipWhereUniqueInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaMembership>;

  findFlexible(
    ctx: IContext,
    communityId: string,
    userKey: string
  ): Promise<PrismaMembership | null>;
}
