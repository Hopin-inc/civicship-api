import { IContext } from "@/types/server";
import { PrismaUserDetail } from "@/application/domain/account/user/data/type";
import { Prisma } from "@prisma/client";

export interface IUserRepository {
  query(
    ctx: IContext,
    where: Prisma.UserWhereInput,
    orderBy: Prisma.UserOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaUserDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaUserDetail | null>;

  findByPhoneNumber(phoneNumber: string): Promise<PrismaUserDetail | null>;

  create(data: Prisma.UserCreateInput): Promise<PrismaUserDetail>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.UserUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaUserDetail>;

  delete(id: string): Promise<PrismaUserDetail>;
}
