import { injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { utilitySelectDetail } from "@/application/domain/reward/utility/data/type";
import { IUtilityRepository } from "./interface";

@injectable()
export default class UtilityRepository implements IUtilityRepository {
  async query(
    ctx: IContext,
    where: Prisma.UtilityWhereInput,
    orderBy: Prisma.UtilityOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.utility.findMany({
        where,
        orderBy,
        select: utilitySelectDetail,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.utility.findUnique({
        where: { id },
        select: utilitySelectDetail,
      });
    });
  }

  async findAccessible(
    ctx: IContext,
    where: Prisma.UtilityWhereUniqueInput & Prisma.UtilityWhereInput,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.utility.findUnique({
        where,
        select: utilitySelectDetail,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.UtilityCreateInput, tx: Prisma.TransactionClient) {
    return tx.utility.create({
      data,
      select: utilitySelectDetail,
    });
  }

  async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return tx.utility.delete({
      where: { id },
      select: utilitySelectDetail,
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.UtilityUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.utility.update({
      where: { id },
      data,
      select: utilitySelectDetail,
    });
  }
}
