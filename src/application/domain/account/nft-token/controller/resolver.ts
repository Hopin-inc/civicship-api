import { GqlQueryNftTokensArgs, GqlQueryNftTokenArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import NftTokenUseCase from "@/application/domain/account/nft-token/usecase";
import { PrismaNftToken } from "@/application/domain/account/nft-token/data/type";

@injectable()
export default class NftTokenResolver {
  constructor(@inject("NftTokenUseCase") private readonly useCase: NftTokenUseCase) {}

  Query = {
    nftTokens: async (_: unknown, args: GqlQueryNftTokensArgs, ctx: IContext) => {
      return this.useCase.getNftTokens(args.filter, args.sort, ctx, args.cursor, args.first);
    },
    nftToken: async (_: unknown, args: GqlQueryNftTokenArgs, ctx: IContext) => {
      return this.useCase.getNftToken(args.id, ctx);
    },
  };

  NftToken = {
    community: (parent: PrismaNftToken, _: unknown, ctx: IContext) => {
      return parent.communityId ? ctx.loaders.community.load(parent.communityId) : null;
    },
  };
}
