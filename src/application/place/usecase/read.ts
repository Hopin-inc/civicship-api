import {
  GqlQueryPlacesArgs,
  GqlQueryPlaceArgs,
  GqlPlacesConnection,
  GqlPlace,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { clampFirst } from "@/utils";
import PlaceService from "@/application/place/service";
import PlaceOutputFormat from "@/presentation/graphql/dto/place/output";

export default class PlaceReadUseCase {
  static async userBrowsePlaces(
    { filter, sort, cursor, first }: GqlQueryPlacesArgs,
    ctx: IContext,
  ): Promise<GqlPlacesConnection> {
    const take = clampFirst(first);

    const res = await PlaceService.fetchPlaces(ctx, { filter, sort, cursor }, take);

    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => PlaceOutputFormat.get(record));

    return PlaceOutputFormat.query(data, hasNextPage);
  }

  static async userViewPlace({ id }: GqlQueryPlaceArgs, ctx: IContext): Promise<GqlPlace | null> {
    const place = await PlaceService.findPlace(ctx, id);
    if (!place) {
      return null;
    }
    return PlaceOutputFormat.get(place);
  }
}
