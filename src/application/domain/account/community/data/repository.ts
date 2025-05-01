import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/domain/account/community/data/type";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import ICommunityRepository from "@/application/domain/account/community/data/interface";

@injectable()
export default class CommunityRepository implements ICommunityRepository {
  async query(
    ctx: IContext,
    where: Prisma.CommunityWhereInput,
    orderBy: Prisma.CommunityOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.community.findMany({
        where,
        orderBy,
        include: communityInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.community.findUnique({
        where: { id },
        include: communityInclude,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.CommunityCreateInput, tx: Prisma.TransactionClient) {
    return tx.community.create({
      data,
      include: communityInclude,
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.CommunityUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.community.update({
      where: { id },
      data,
      include: communityInclude,
    });
  }

  async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return tx.community.delete({
      where: { id },
      include: communityInclude,
    });
  }
}
