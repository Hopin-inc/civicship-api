import { GqlPlaceCreateInput, GqlPlaceUpdateInput, GqlQueryPlacesArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import PlaceConverter from "@/application/place/data/converter";
import PlaceRepository from "@/application/place/data/repository";
import { NotFoundError } from "@/errors/graphql";

export default class PlaceService {
  static async fetchPlaces(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryPlacesArgs,
    take: number,
  ) {
    const where = PlaceConverter.filter(filter ?? {});
    const orderBy = PlaceConverter.sort(sort ?? {});

    return await PlaceRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findPlace(ctx: IContext, id: string) {
    return await PlaceRepository.find(ctx, id);
  }

  static async createPlace(ctx: IContext, input: GqlPlaceCreateInput) {
    const data: Prisma.PlaceCreateInput = PlaceConverter.create(input);

    return PlaceRepository.create(ctx, data);
  }

  static async deletePlace(ctx: IContext, id: string) {
    const place = await PlaceRepository.find(ctx, id);
    if (!place) {
      throw new NotFoundError("Place", { id });
    }

    return await PlaceRepository.delete(ctx, id);
  }

  static async updatePlace(ctx: IContext, id: string, input: GqlPlaceUpdateInput) {
    const place = await PlaceRepository.find(ctx, id);
    if (!place) {
      throw new NotFoundError("Place", { id });
    }

    const data: Prisma.PlaceUpdateInput = PlaceConverter.update(input);

    return await PlaceRepository.update(ctx, id, data);
  }
}
