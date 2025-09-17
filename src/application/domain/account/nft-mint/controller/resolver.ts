import { GqlMutationResolvers } from '@/types/graphql';
import { IContext } from '@/types/server';
import { injectable, inject } from 'tsyringe';
import NftMintUseCase from '@/application/domain/account/nft-mint/usecase';

@injectable()
export default class NftMintResolver {
  constructor(
    @inject("NftMintUseCase") private readonly nftMintUseCase: NftMintUseCase,
  ) {}

  Mutation: GqlMutationResolvers = {
    issueResidentNft: (_p, { input }, ctx: IContext) => 
      this.nftMintUseCase.issueResidentNft(ctx, input),
  };
}
