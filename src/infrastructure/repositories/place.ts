import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { placeInclude } from "@/infrastructure/prisma/types/place";
import { IContext } from "@/types/server";

export default class PlaceRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.PlaceWhereInput,
    orderBy: Prisma.PlaceOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.place.findMany({
        where,
        orderBy,
        include: placeInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.place.findUnique({
        where: { id },
        include: placeInclude,
      });
    });
  }

  static async create(ctx: IContext, data: Prisma.PlaceCreateInput, tx: Prisma.TransactionClient) {
    return tx.place.create({
      data,
      include: placeInclude,
    });
  }

  static async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return tx.place.delete({
      where: { id },
      include: placeInclude,
    });
  }

  static async update(
    ctx: IContext,
    id: string,
    data: Prisma.PlaceUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.place.update({
      where: { id },
      data,
      include: placeInclude,
    });
  }
}
