import { prismaClient } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IUserRepository } from "@/application/domain/account/user/data/interface";
import { userSelectDetail } from "@/application/domain/account/user/data/type";
import { inject, injectable } from "tsyringe";

@injectable()
export default class UserRepository implements IUserRepository {
  constructor(@inject("prismaClient") private readonly db: typeof prismaClient) {}

  async query(
    ctx: IContext,
    where: Prisma.UserWhereInput,
    orderBy: Prisma.UserOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return ctx.issuer.onlyBelongingCommunity(ctx, (tx) => {
      return tx.user.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        select: userSelectDetail,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return ctx.issuer.onlyBelongingCommunity(ctx, (tx) => {
      return tx.user.findUnique({
        where: { id },
        select: userSelectDetail,
      });
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.db.user.create({
      data,
      select: userSelectDetail,
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.UserUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.user.update({
      where: { id },
      data,
      select: userSelectDetail,
    });
  }

  async delete(id: string) {
    return this.db.user.delete({
      where: { id },
      select: userSelectDetail,
    });
  }
}
