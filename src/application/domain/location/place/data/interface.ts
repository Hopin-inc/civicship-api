import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaPlaceDetail } from "./type";
import { GqlQueryPlacesArgs, GqlPlaceCreateInput, GqlPlaceUpdateInput } from "@/types/graphql";

export interface IPlaceService {
  fetchPlaces(ctx: IContext, args: GqlQueryPlacesArgs, take: number): Promise<PrismaPlaceDetail[]>;

  findPlace(ctx: IContext, id: string): Promise<PrismaPlaceDetail | null>;

  findPlaceOrThrow(ctx: IContext, id: string): Promise<PrismaPlaceDetail>;

  createPlace(
    ctx: IContext,
    input: GqlPlaceCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaPlaceDetail>;

  deletePlace(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaPlaceDetail>;

  updatePlace(
    ctx: IContext,
    id: string,
    input: GqlPlaceUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaPlaceDetail>;
}

export interface IPlaceRepository {
  query(
    ctx: IContext,
    where: Prisma.PlaceWhereInput,
    orderBy: Prisma.PlaceOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaPlaceDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaPlaceDetail | null>;

  create(
    ctx: IContext,
    data: Prisma.PlaceCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaPlaceDetail>;

  delete(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaPlaceDetail>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.PlaceUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaPlaceDetail>;
}
