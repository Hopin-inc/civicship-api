import { GqlPlaceCreateInput, GqlPlaceUpdateInput, GqlQueryPlacesArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";

import PlaceInputFormat from "@/presentation/graphql/dto/place/input";
import PlaceRepository from "@/infra/prisma/repositories/place";

export default class PlaceService {
  static async fetchPlaces(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryPlacesArgs,
    take: number,
  ) {
    const where = PlaceInputFormat.filter(filter ?? {});
    const orderBy = PlaceInputFormat.sort(sort ?? {});

    return await PlaceRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findPlace(ctx: IContext, id: string) {
    return await PlaceRepository.find(ctx, id);
  }

  static async createPlace(
    ctx: IContext,
    input: GqlPlaceCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    const data: Prisma.PlaceCreateInput = PlaceInputFormat.create(input);

    return PlaceRepository.create(ctx, data, tx);
  }

  static async deletePlace(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    const place = await PlaceRepository.find(ctx, id);
    if (!place) {
      throw new Error(`PlaceNotFound: ID=${id}`);
    }

    return await PlaceRepository.delete(ctx, id, tx);
  }

  static async updatePlace(
    ctx: IContext,
    id: string,
    input: GqlPlaceUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    const place = await PlaceRepository.find(ctx, id);
    if (!place) {
      throw new Error(`PlaceNotFound: ID=${id}`);
    }

    const data: Prisma.PlaceUpdateInput = PlaceInputFormat.update(input);

    return await PlaceRepository.update(ctx, id, data, tx);
  }
}
