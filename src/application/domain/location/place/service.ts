import { GqlPlaceCreateInput, GqlPlaceUpdateInput, GqlQueryPlacesArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import PlaceConverter from "@/application/domain/location/place/data/converter";
import { IPlaceRepository, IPlaceService } from "@/application/domain/location/place/data/interface";
import { NotFoundError } from "@/errors/graphql";

@injectable()
export default class PlaceService implements IPlaceService {
  constructor(
    @inject("PlaceConverter") private readonly converter: PlaceConverter,
    @inject("IPlaceRepository") private readonly repository: IPlaceRepository,
  ) { }

  async fetchPlaces(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryPlacesArgs,
    take: number,
  ) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    return await this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findPlace(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
  }

  async findPlaceOrThrow(ctx: IContext, id: string) {
    const place = await this.repository.find(ctx, id);
    if (!place) {
      throw new NotFoundError("Place", { id });
    }
    return place;
  }

  async createPlace(ctx: IContext, input: GqlPlaceCreateInput, tx: Prisma.TransactionClient) {
    const data: Prisma.PlaceCreateInput = this.converter.create(input);
    return this.repository.create(ctx, data, tx);
  }

  async deletePlace(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    await this.findPlaceOrThrow(ctx, id);
    return this.repository.delete(ctx, id, tx);
  }

  async updatePlace(ctx: IContext, id: string, input: GqlPlaceUpdateInput, tx: Prisma.TransactionClient) {
    await this.findPlaceOrThrow(ctx, id);
    const data: Prisma.PlaceUpdateInput = this.converter.update(input);
    return this.repository.update(ctx, id, data, tx);
  }
}
