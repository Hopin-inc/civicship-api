import {
  GqlQueryPlacesArgs,
  GqlQueryPlaceArgs,
  GqlMutationPlaceCreateArgs,
  GqlMutationPlaceDeleteArgs,
  GqlMutationPlaceUpdateArgs,
  GqlPlaceCreatePayload,
  GqlPlaceDeletePayload,
  GqlPlaceUpdatePayload,
} from "@/types/graphql";
import { PrismaPlaceDetail } from "@/application/domain/location/place/data/type";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import PlaceUseCase from "@/application/domain/location/place/usecase";

@injectable()
export default class PlaceResolver {
  constructor(@inject("PlaceUseCase") private readonly placeUseCase: PlaceUseCase) {}

  Query = {
    places: (_: unknown, args: GqlQueryPlacesArgs, ctx: IContext) => {
      return this.placeUseCase.userBrowsePlaces(args, ctx);
    },
    place: (_: unknown, args: GqlQueryPlaceArgs, ctx: IContext) => {
      return ctx.loaders.place.load(args.id);
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
    image: (parent: PrismaPlaceDetail, _: unknown, ctx: IContext) => {
      return parent.imageId ? ctx.loaders.image.load(parent.imageId) : null;
    },

    city: (parent: PrismaPlaceDetail, _: unknown, ctx: IContext) => {
      return parent.cityCode ? ctx.loaders.city.load(parent.cityCode) : null;
    },

    community: (parent: PrismaPlaceDetail, _: unknown, ctx: IContext) => {
      return parent.communityId ? ctx.loaders.community.load(parent.communityId) : null;
    },

    opportunities: (parent: PrismaPlaceDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.opportunitiesByPlace.load(parent.id);
    },
  };
}
