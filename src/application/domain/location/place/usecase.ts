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
import PlaceService from "@/application/domain/location/place/service";
import PlacePresenter from "@/application/domain/location/place/presenter";

export default class PlaceUseCase {
  static async userBrowsePlaces(
    { filter, sort, cursor, first }: GqlQueryPlacesArgs,
    ctx: IContext,
  ): Promise<GqlPlacesConnection> {
    const take = clampFirst(first);

    const res = await PlaceService.fetchPlaces(ctx, { filter, sort, cursor }, take);

    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => PlacePresenter.get(record));

    return PlacePresenter.query(data, hasNextPage);
  }

  static async userViewPlace({ id }: GqlQueryPlaceArgs, ctx: IContext): Promise<GqlPlace | null> {
    const place = await PlaceService.findPlace(ctx, id);
    if (!place) {
      return null;
    }
    return PlacePresenter.get(place);
  }

  static async managerCreatePlace(
    { input }: GqlMutationPlaceCreateArgs,
    ctx: IContext,
  ): Promise<GqlPlaceCreatePayload> {
    const place = await PlaceService.createPlace(ctx, input);
    return PlacePresenter.create(place);
  }

  static async managerUpdatePlace(
    { id, input }: GqlMutationPlaceUpdateArgs,
    ctx: IContext,
  ): Promise<GqlPlaceUpdatePayload> {
    const place = await PlaceService.updatePlace(ctx, id, input);
    return PlacePresenter.update(place);
  }

  static async managerDeletePlace(
    { id }: GqlMutationPlaceDeleteArgs,
    ctx: IContext,
  ): Promise<GqlPlaceDeletePayload> {
    const deletedPlace = await PlaceService.deletePlace(ctx, id);
    return PlacePresenter.delete(deletedPlace);
  }
}
