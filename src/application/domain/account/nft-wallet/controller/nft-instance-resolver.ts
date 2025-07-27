import { GqlQueryNftInstancesArgs, GqlQueryNftInstanceArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import NftInstanceUseCase from "@/application/domain/account/nft-wallet/nft-instance-usecase";

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
}
