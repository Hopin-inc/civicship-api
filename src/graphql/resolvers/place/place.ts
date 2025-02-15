import {
  GqlQueryPlacesArgs,
  GqlQueryPlaceArgs,
  GqlPlace,
  GqlPlaceOpportunitiesArgs,
  GqlOpportunitiesConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityUseCase from "@/domains/opportunity/usecase";
import PlaceUseCase from "@/domains/place/usecase";

const placeResolver = {
  Query: {
    places: async (_: unknown, args: GqlQueryPlacesArgs, ctx: IContext) => {
      return PlaceUseCase.userBrowsePlaces(args, ctx);
    },
    place: async (_: unknown, args: GqlQueryPlaceArgs, ctx: IContext) => {
      if (!ctx.loaders?.place) {
        return PlaceUseCase.userViewPlace(args, ctx);
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
      return OpportunityUseCase.visitorBrowseOpportunitiesByPlace(parent, args, ctx);
    },
  },
};

export default placeResolver;
