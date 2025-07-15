import { Prisma } from "@prisma/client";
import { citySelectDetail } from "@/application/domain/location/master/data/type";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import IMasterRepository from "@/application/domain/location/master/data/interface";

@injectable()
export default class MasterRepository implements IMasterRepository {
  async findCities(
    ctx: IContext,
    where: Prisma.CityWhereInput,
    orderBy: Prisma.CityOrderByWithRelationInput[],
    take: number,
    cursor?: string
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.city.findMany({
        where,
        select: citySelectDetail,
        orderBy,
        take,
        skip: cursor ? 1 : undefined,
      });
    });
  }

  async findStates(
    ctx: IContext,
    where: Prisma.StateWhereInput,
    orderBy: Prisma.StateOrderByWithRelationInput[],
    take: number,
    cursor?: string
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.state.findMany({
        where,
        select: {
          code: true,
          name: true,
          countryCode: true,
        },
        orderBy,
        take,
        skip: cursor ? 1 : undefined,
      });
    });
  }

  static async checkCityExists(id: string) {
    const { prismaClient } = await import("@/infrastructure/prisma/client");
    return prismaClient.city.findUnique({
      where: { code: id },
      include: { state: true },
    });
  }
}
