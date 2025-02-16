import {
  GqlQueryPlacesArgs,
  GqlQueryPlaceArgs,
  GqlPlace,
  GqlPlaceOpportunitiesArgs,
  GqlOpportunitiesConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import PlaceReadUseCase from "@/app/place/usecase/read";
import OpportunityReadUseCase from "@/app/opportunity/usecase/read";

const placeResolver = {
  Query: {
    places: async (_: unknown, args: GqlQueryPlacesArgs, ctx: IContext) => {
      return PlaceReadUseCase.userBrowsePlaces(args, ctx);
    },
    place: async (_: unknown, args: GqlQueryPlaceArgs, ctx: IContext) => {
      if (!ctx.loaders?.place) {
        return PlaceReadUseCase.userViewPlace(args, ctx);
      }
      return await ctx.loaders.place.load(args.id);
    },
  },
  Place: {
    opportunities: async (
      parent: GqlPlace,
      args: GqlPlaceOpportunitiesArgs,
      ctx: IContext,
    ): Promise<GqlOpportunitiesConnection> => {
      return OpportunityReadUseCase.visitorBrowseOpportunitiesByPlace(parent, args, ctx);
    },
  },
};

export default placeResolver;
