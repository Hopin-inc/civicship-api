import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaCityDetail } from "@/application/domain/location/master/data/type";

type PrismaStateDetail = {
  code: string;
  name: string;
  countryCode: string;
};

export default interface IMasterRepository {
  findCities(
    ctx: IContext,
    where: Prisma.CityWhereInput,
    orderBy: Prisma.CityOrderByWithRelationInput[],
    take: number,
    cursor?: string
  ): Promise<PrismaCityDetail[]>;

  findStates(
    ctx: IContext,
    where: Prisma.StateWhereInput,
    orderBy: Prisma.StateOrderByWithRelationInput[],
    take: number,
    cursor?: string
  ): Promise<PrismaStateDetail[]>;
}
