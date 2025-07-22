import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export default interface IMasterRepository {
  findCities(
    ctx: IContext,
    where: Prisma.CityWhereInput,
    orderBy: Prisma.CityOrderByWithRelationInput[],
    take: number,
    cursor?: string
  ): Promise<any[]>;

  findStates(
    ctx: IContext,
    where: Prisma.StateWhereInput,
    orderBy: Prisma.StateOrderByWithRelationInput[],
    take: number,
    cursor?: string
  ): Promise<any[]>;
}
