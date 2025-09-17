import { injectable } from "tsyringe";
import { GqlGqlIssueNftPayload, GqlGqlMintStatus } from "@/types/graphql";
import { NftMintForPresenter } from "./data/type";

@injectable()
export default class NftMintPresenter {
  presentIssueNft(mint: NftMintForPresenter): GqlGqlIssueNftPayload {
    return {
      mintId: mint.id,
      txHash: mint.txHash ?? null,
      status: mint.status as GqlGqlMintStatus,
    };
  }
}
