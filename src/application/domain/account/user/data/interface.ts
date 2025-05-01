import { IContext } from "@/types/server";
import { PrismaUser } from "@/application/domain/account/user/data/type";
import { Prisma } from "@prisma/client";

export interface IUserRepository {
  query(
    ctx: IContext,
    where: Prisma.UserWhereInput,
    orderBy: Prisma.UserOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaUser[]>;

  find(ctx: IContext, id: string): Promise<PrismaUser | null>;

  create(data: Prisma.UserCreateInput): Promise<PrismaUser>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.UserUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaUser>;

  delete(id: string): Promise<PrismaUser>;
}
