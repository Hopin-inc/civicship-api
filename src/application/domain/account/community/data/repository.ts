import { Prisma } from "@prisma/client";
import {
  communityCreateSelect,
  communitySelectDetail,
} from "@/application/domain/account/community/data/type";
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
        select: communitySelectDetail,
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
        select: communitySelectDetail,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.CommunityCreateInput, tx: Prisma.TransactionClient) {
    return tx.community.create({
      data,
      select: communityCreateSelect,
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
      select: communitySelectDetail,
    });
  }

  async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return tx.community.delete({
      where: { id },
      select: communitySelectDetail,
    });
  }

  async findNameById(ctx: IContext, id: string): Promise<string | null> {
    const community = await ctx.issuer.public(ctx, (tx) =>
      tx.community.findUnique({
        where: { id },
        select: { name: true },
      }),
    );
    return community?.name ?? null;
  }
}
