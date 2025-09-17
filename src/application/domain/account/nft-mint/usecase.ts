import { inject, injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { GqlIssueResidentNftInput, GqlGqlIssueNftPayload } from "@/types/graphql";
import NftMintService from "./service";
import NftMintPresenter from "./presenter";

@injectable()
export default class NftMintUseCase {
  constructor(
    @inject("NftMintService") private readonly svc: NftMintService,
    @inject("NftMintPresenter") private readonly presenter: NftMintPresenter,
  ) {}

  async issueResidentNft(ctx: IContext, input: GqlIssueResidentNftInput): Promise<GqlGqlIssueNftPayload> {
    const policyId = process.env.POLICY_ID ?? "policy_dev";

    return ctx.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const queued = await this.svc.queueMint(ctx, tx, {
        policyId,
        productKey: input.productKey,
        receiver: input.receiverAddress,
      });

      try {
        const txHash = await this.svc.mintNow(ctx, tx, queued.id);
        const minted = await this.svc.markMinted(ctx, tx, queued.id, txHash);
        return this.presenter.presentIssueNft(minted);
      } catch (e) {
        const failed = await this.svc.markFailed(ctx, tx, queued.id, e instanceof Error ? e.message : String(e));
        return this.presenter.presentIssueNft(failed);
      }
    });
  }
}
