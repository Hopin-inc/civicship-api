import {
  GqlQueryPlacesArgs,
  GqlQueryPlaceArgs,
  GqlPlacesConnection,
  GqlPlace,
  GqlMutationPlaceCreateArgs,
  GqlPlaceCreatePayload,
  GqlMutationPlaceUpdateArgs,
  GqlPlaceUpdatePayload,
  GqlMutationPlaceDeleteArgs,
  GqlPlaceDeletePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { clampFirst } from "@/application/domain/utils";
import { injectable, inject } from "tsyringe";
import { IPlaceService } from "@/application/domain/location/place/data/interface";
import PlacePresenter from "@/application/domain/location/place/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

@injectable()
export default class PlaceUseCase {
  constructor(
    @inject("PlaceService") private readonly service: IPlaceService,
    @inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer,
  ) {}

  async userBrowsePlaces(
    { filter, sort, cursor, first }: GqlQueryPlacesArgs,
    ctx: IContext,
  ): Promise<GqlPlacesConnection> {
    const take = clampFirst(first);

    const res = await this.service.fetchPlaces(ctx, { filter, sort, cursor }, take);

    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => PlacePresenter.get(record));

    return PlacePresenter.query(data, hasNextPage);
  }

  async userViewPlace({ id }: GqlQueryPlaceArgs, ctx: IContext): Promise<GqlPlace | null> {
    const place = await this.service.findPlace(ctx, id);
    if (!place) {
      return null;
    }
    return PlacePresenter.get(place);
  }

  async managerCreatePlace(
    { input }: GqlMutationPlaceCreateArgs,
    ctx: IContext,
  ): Promise<GqlPlaceCreatePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const place = await this.service.createPlace(ctx, input, tx);
      return PlacePresenter.create(place);
    });
  }

  async managerUpdatePlace(
    { id, input }: GqlMutationPlaceUpdateArgs,
    ctx: IContext,
  ): Promise<GqlPlaceUpdatePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const place = await this.service.updatePlace(ctx, id, input, tx);
      return PlacePresenter.update(place);
    });
  }

  async managerDeletePlace(
    { id }: GqlMutationPlaceDeleteArgs,
    ctx: IContext,
  ): Promise<GqlPlaceDeletePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const deletedPlace = await this.service.deletePlace(ctx, id, tx);
      return PlacePresenter.delete(deletedPlace);
    });
  }
}
