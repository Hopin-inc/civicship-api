import { GqlMutationResolvers } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import NftMintUseCase from "../usecase";

@injectable()
export default class NftMintResolver {
  constructor(@inject("NftMintUseCase") private readonly usecase: NftMintUseCase) {}

  Mutation: GqlMutationResolvers = {
    issueResidentNft: (_p, { input }, ctx: IContext) => this.usecase.issueResidentNft(ctx, input),
  };
}
