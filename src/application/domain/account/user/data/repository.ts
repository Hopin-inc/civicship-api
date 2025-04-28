import { PrismaClientIssuer, prismaClient } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IUserRepository } from "@/application/domain/account/user/data/interface";
import { userInclude } from "@/application/domain/account/user/data/type";

export default class UserRepository implements IUserRepository {
  constructor(
    private readonly issuer: PrismaClientIssuer,
    private readonly db: typeof prismaClient,
  ) {}

  async query(
    ctx: IContext,
    where: Prisma.UserWhereInput,
    orderBy: Prisma.UserOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.user.findMany({
        where,
        orderBy,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: userInclude,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.user.findUnique({
        where: { id },
        include: userInclude,
      });
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.db.user.create({
      data,
      include: userInclude,
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
      include: userInclude,
    });
  }

  async delete(id: string) {
    return this.db.user.delete({
      where: { id },
      include: userInclude,
    });
  }
}
