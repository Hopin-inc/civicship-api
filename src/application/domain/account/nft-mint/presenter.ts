import { GqlGqlIssueNftPayload, GqlGqlMintStatus } from "@/types/graphql";
import { NftMintForPresenter } from "./data/type";

export function presentIssueNft(mint: NftMintForPresenter): GqlGqlIssueNftPayload {
  return {
    mintId: mint.id,
    txHash: mint.txHash ?? null,
    status: mint.status as GqlGqlMintStatus,
  };
}
