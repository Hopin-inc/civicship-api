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
import PlaceUseCase from "@/application/domain/location/place/usecase";
import { container } from "tsyringe";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";

const placeResolver = {
  Query: {
    places: async (_: unknown, args: GqlQueryPlacesArgs, ctx: IContext) => {
      const useCase = container.resolve(PlaceUseCase);
      return useCase.userBrowsePlaces(args, ctx);
    },
    place: async (_: unknown, args: GqlQueryPlaceArgs, ctx: IContext) => {
      if (!ctx.loaders?.place) {
        const useCase = container.resolve(PlaceUseCase);
        return useCase.userViewPlace(args, ctx);
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
      const useCase = container.resolve(PlaceUseCase);
      return useCase.managerCreatePlace(args, ctx);
    },
    placeDelete: async (
      _: unknown,
      args: GqlMutationPlaceDeleteArgs,
      ctx: IContext,
    ): Promise<GqlPlaceDeletePayload> => {
      const useCase = container.resolve(PlaceUseCase);
      return useCase.managerDeletePlace(args, ctx);
    },
    placeUpdate: async (
      _: unknown,
      args: GqlMutationPlaceUpdateArgs,
      ctx: IContext,
    ): Promise<GqlPlaceUpdatePayload> => {
      const useCase = container.resolve(PlaceUseCase);
      return useCase.managerUpdatePlace(args, ctx);
    },
  },
  Place: {
    opportunities: async (
      parent: GqlPlace,
      args: GqlPlaceOpportunitiesArgs,
      ctx: IContext,
    ): Promise<GqlOpportunitiesConnection> => {
      const opportunityUseCase = container.resolve<OpportunityUseCase>("OpportunityUseCase");
      return opportunityUseCase.anyoneBrowseOpportunities(
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
