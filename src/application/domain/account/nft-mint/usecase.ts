import { inject, injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { GqlIssueResidentNftInput, GqlGqlIssueNftPayload } from "@/types/graphql";
import NftMintService from "./service";
import NftMintPresenter from "./presenter";
import logger from "@/infrastructure/logging";

@injectable()
export default class NftMintUseCase {
  constructor(
    @inject("NftMintService") private readonly svc: NftMintService,
    @inject("NftMintPresenter") private readonly presenter: NftMintPresenter,
  ) {}

  async issueResidentNft(ctx: IContext, input: GqlIssueResidentNftInput): Promise<GqlGqlIssueNftPayload> {
    const policyId = process.env.POLICY_ID ?? "policy_dev";
    const startTime = Date.now();

    const queueStart = Date.now();
    const queued = await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      return this.svc.queueMint(ctx, tx, {
        policyId,
        productKey: input.productKey,
        receiver: input.receiverAddress,
      });
    });
    logger.info(`NFT mint queue phase completed in ${Date.now() - queueStart}ms`);

    try {
      const mintStart = Date.now();
      const txHash = await this.svc.mintNow(ctx, queued.id);
      logger.info(`NFT external mint completed in ${Date.now() - mintStart}ms`);
      
      const markStart = Date.now();
      const minted = await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
        return this.svc.markMinted(ctx, tx, queued.id, txHash);
      });
      logger.info(`NFT mark minted phase completed in ${Date.now() - markStart}ms`);
      logger.info(`Total NFT mint process completed in ${Date.now() - startTime}ms`);
      
      return this.presenter.presentIssueNft(minted);
    } catch (e) {
      const failStart = Date.now();
      const failed = await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
        return this.svc.markFailed(ctx, tx, queued.id, e instanceof Error ? e.message : String(e));
      });
      logger.info(`NFT mark failed phase completed in ${Date.now() - failStart}ms`);
      logger.error(`NFT mint failed after ${Date.now() - startTime}ms: ${e instanceof Error ? e.message : String(e)}`);
      
      return this.presenter.presentIssueNft(failed);
    }
  }
}
