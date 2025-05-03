import { Prisma } from "@prisma/client";
import { placeSelectDetail } from "@/application/domain/location/place/data/type";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { IPlaceRepository } from "@/application/domain/location/place/data/interface";

@injectable()
export default class PlaceRepository implements IPlaceRepository {
  async query(
    ctx: IContext,
    where: Prisma.PlaceWhereInput,
    orderBy: Prisma.PlaceOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.place.findMany({
        where,
        orderBy,
        select: placeSelectDetail,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  async find(ctx: IContext, id: string) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.place.findUnique({
        where: { id },
        select: placeSelectDetail,
      });
    });
  }

  async create(ctx: IContext, data: Prisma.PlaceCreateInput, tx: Prisma.TransactionClient) {
    return tx.place.create({
      data,
      select: placeSelectDetail,
    });
  }

  async delete(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    return tx.place.delete({
      where: { id },
      select: placeSelectDetail,
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.PlaceUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.place.update({
      where: { id },
      data,
      select: placeSelectDetail,
    });
  }
}
