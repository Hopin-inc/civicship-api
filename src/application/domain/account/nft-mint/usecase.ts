import { GqlIssueResidentNftInput, GqlGqlIssueNftPayload, GqlGqlMintStatus } from '@/types/graphql';
import { IContext } from '@/types/server';
import { injectable } from 'tsyringe';

@injectable()
export default class NftMintUseCase {
  async issueResidentNft(
    _ctx: IContext,
    _input: GqlIssueResidentNftInput
  ): Promise<GqlGqlIssueNftPayload> {
    return { mintId: 'TEMP_NOT_IMPLEMENTED', txHash: null, status: GqlGqlMintStatus.Queued };
  }
}
