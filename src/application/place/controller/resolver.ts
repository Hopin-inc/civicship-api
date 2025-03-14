import {
  GqlQueryPlacesArgs,
  GqlQueryPlaceArgs,
  GqlPlace,
  GqlPlaceOpportunitiesArgs,
  GqlOpportunitiesConnection,
  GqlMutationPlaceCreateArgs,
  GqlMutationPlaceUpdateArgs,
  GqlMutationPlaceDeleteArgs,
  GqlPlaceCreatePayload,
  GqlPlaceDeletePayload,
  GqlPlaceUpdatePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import PlaceUseCase from "@/application/place/usecase";
import OpportunityUseCase from "@/application/opportunity/usecase";

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
  Mutation: {
    placeCreate: async (
      _: unknown,
      args: GqlMutationPlaceCreateArgs,
      ctx: IContext,
    ): Promise<GqlPlaceCreatePayload> => {
      return PlaceUseCase.managerCreatePlace(args, ctx);
    },
    placeDelete: async (
      _: unknown,
      args: GqlMutationPlaceDeleteArgs,
      ctx: IContext,
    ): Promise<GqlPlaceDeletePayload> => {
      return PlaceUseCase.managerDeletePlace(args, ctx);
    },
    placeUpdate: async (
      _: unknown,
      args: GqlMutationPlaceUpdateArgs,
      ctx: IContext,
    ): Promise<GqlPlaceUpdatePayload> => {
      return PlaceUseCase.managerUpdatePlace(args, ctx);
    },
  },
  Place: {
    opportunities: async (
      parent: GqlPlace,
      args: GqlPlaceOpportunitiesArgs,
      ctx: IContext,
    ): Promise<GqlOpportunitiesConnection> => {
      return OpportunityUseCase.anyoneBrowseOpportunities(
        {
          ...args,
          filter: { ...args.filter, placeIds: [parent.id] },
        },
        ctx,
      );
    },
  },
};

export default placeResolver;
