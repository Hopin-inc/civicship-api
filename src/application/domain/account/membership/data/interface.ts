import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaMembership } from "@/application/domain/account/membership/data/type";

export interface IMembershipRepository {
  query(
    ctx: IContext,
    where: Prisma.MembershipWhereInput,
    orderBy: Prisma.MembershipOrderByWithRelationInput[],
    take: number,
    cursor?: Prisma.MembershipUserIdCommunityIdCompoundUniqueInput,
  ): Promise<PrismaMembership[]>;

  find(ctx: IContext, where: Prisma.MembershipWhereUniqueInput): Promise<PrismaMembership | null>;

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
}
