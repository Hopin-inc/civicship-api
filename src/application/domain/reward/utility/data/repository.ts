import { injectable, inject } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { utilityInclude } from "@/application/domain/reward/utility/data/type";
import { IUtilityRepository } from "./interface";

@injectable()
export default class UtilityRepository implements IUtilityRepository {
  constructor(
    @inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer,
  ) { }

  async query(
    ctx: IContext,
    where: Prisma.UtilityWhereInput,
    orderBy: Prisma.UtilityOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utility.findMany({
        where,
        orderBy,
        include: utilityInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utility.findUnique({
        where: { id },
        include: utilityInclude,
      });
    });
  }

  async findAccessible(
    ctx: IContext,
    where: Prisma.UtilityWhereUniqueInput & Prisma.UtilityWhereInput,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.utility.findUnique({
        where,
        include: utilityInclude,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.UtilityCreateInput, tx: Prisma.TransactionClient) {
    return tx.utility.create({
      data,
      include: utilityInclude,
    });
  }

  async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return tx.utility.delete({
      where: { id },
      include: utilityInclude,
    });
  }

  async update(ctx: IContext, id: string, data: Prisma.UtilityUpdateInput, tx: Prisma.TransactionClient) {
    return tx.utility.update({
      where: { id },
      data,
      include: utilityInclude,
    });
  }
}