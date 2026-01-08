import { GqlQueryNftInstancesArgs, GqlQueryNftInstanceArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import NftInstanceUseCase from "@/application/domain/account/nft-instance/usecase";
import { PrismaNftInstance } from "@/application/domain/account/nft-instance/data/type";

@injectable()
export default class NftInstanceResolver {
  constructor(@inject("NftInstanceUseCase") private readonly useCase: NftInstanceUseCase) {}

  Query = {
    nftInstances: async (_: unknown, args: GqlQueryNftInstancesArgs, ctx: IContext) => {
      return this.useCase.getNftInstances(args.filter, args.sort, ctx, args.cursor, args.first);
    },
    nftInstance: async (_: unknown, args: GqlQueryNftInstanceArgs, ctx: IContext) => {
      return this.useCase.getNftInstance(args.id, ctx);
    },
  };

  NftInstance = {
    community: (parent: PrismaNftInstance, _: unknown, ctx: IContext) => {
      return parent.communityId ? ctx.loaders.community.load(parent.communityId) : null;
    },
  };
}
