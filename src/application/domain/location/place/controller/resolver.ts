import {
  GqlQueryPlacesArgs,
  GqlQueryPlaceArgs,
  GqlPlace,
  GqlPlaceOpportunitiesArgs,
  GqlOpportunitiesConnection,
  GqlMutationPlaceCreateArgs,
  GqlMutationPlaceDeleteArgs,
  GqlMutationPlaceUpdateArgs,
  GqlPlaceCreatePayload,
  GqlPlaceDeletePayload,
  GqlPlaceUpdatePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import PlaceUseCase from "@/application/domain/location/place/usecase";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";

@injectable()
export default class PlaceResolver {
  constructor(
    @inject("PlaceUseCase") private readonly placeUseCase: PlaceUseCase,
    @inject("OpportunityUseCase") private readonly opportunityUseCase: OpportunityUseCase,
  ) {}

  Query = {
    places: (_: unknown, args: GqlQueryPlacesArgs, ctx: IContext) => {
      return this.placeUseCase.userBrowsePlaces(args, ctx);
    },
    place: (_: unknown, args: GqlQueryPlaceArgs, ctx: IContext) => {
      return this.placeUseCase.userViewPlace(args, ctx);
    },
  };

  Mutation = {
    placeCreate: (
      _: unknown,
      args: GqlMutationPlaceCreateArgs,
      ctx: IContext,
    ): Promise<GqlPlaceCreatePayload> => {
      return this.placeUseCase.managerCreatePlace(args, ctx);
    },

    placeDelete: (
      _: unknown,
      args: GqlMutationPlaceDeleteArgs,
      ctx: IContext,
    ): Promise<GqlPlaceDeletePayload> => {
      return this.placeUseCase.managerDeletePlace(args, ctx);
    },

    placeUpdate: (
      _: unknown,
      args: GqlMutationPlaceUpdateArgs,
      ctx: IContext,
    ): Promise<GqlPlaceUpdatePayload> => {
      return this.placeUseCase.managerUpdatePlace(args, ctx);
    },
  };

  Place = {
    opportunities: (
      parent: GqlPlace,
      args: GqlPlaceOpportunitiesArgs,
      ctx: IContext,
    ): Promise<GqlOpportunitiesConnection> => {
      return this.opportunityUseCase.anyoneBrowseOpportunities(
        {
          ...args,
          filter: { ...args.filter, placeIds: [parent.id] },
        },
        ctx,
      );
    },
  };
}
