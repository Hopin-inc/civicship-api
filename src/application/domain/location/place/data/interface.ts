import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaPlace } from "./type";
import { GqlQueryPlacesArgs, GqlPlaceCreateInput, GqlPlaceUpdateInput } from "@/types/graphql";

export interface IPlaceService {
  fetchPlaces(
    ctx: IContext,
    args: GqlQueryPlacesArgs,
    take: number,
  ): Promise<PrismaPlace[]>;

  findPlace(ctx: IContext, id: string): Promise<PrismaPlace | null>;

  findPlaceOrThrow(ctx: IContext, id: string): Promise<PrismaPlace>;

  createPlace(ctx: IContext, input: GqlPlaceCreateInput, tx: Prisma.TransactionClient): Promise<PrismaPlace>;

  deletePlace(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaPlace>;

  updatePlace(ctx: IContext, id: string, input: GqlPlaceUpdateInput, tx: Prisma.TransactionClient): Promise<PrismaPlace>;
}

export interface IPlaceRepository {
  query(
    ctx: IContext,
    where: Prisma.PlaceWhereInput,
    orderBy: Prisma.PlaceOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaPlace[]>;

  find(ctx: IContext, id: string): Promise<PrismaPlace | null>;

  create(ctx: IContext, data: Prisma.PlaceCreateInput, tx: Prisma.TransactionClient): Promise<PrismaPlace>;

  delete(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaPlace>;

  update(ctx: IContext, id: string, data: Prisma.PlaceUpdateInput, tx: Prisma.TransactionClient): Promise<PrismaPlace>;
}