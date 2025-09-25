import { inject, injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import NftMintService from "./service";
import logger from "@/infrastructure/logging";

@injectable()
export default class NftMintUseCase {
  constructor(
    @inject("NftMintService") private readonly nftMintService: NftMintService,
    // @inject("OrderUseCase") private readonly orderUseCase: OrderUseCase,
  ) {}

  async handleWebhook(
    ctx: IContext,
    input: { nftMintId: string; nmkrState: string; txHash?: string },
  ): Promise<void> {
    const newStatus = this.mapNmkrState(input.nmkrState);
    if (!newStatus) {
      logger.warn("Unknown NMKR state", { nmkrState: input.nmkrState, nftMintId: input.nftMintId });
      return;
    }

    await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      const updated = await this.nftMintService.processStateTransition(
        ctx,
        {
          nftMintId: input.nftMintId,
          newStatus,
          txHash: input.txHash,
          error:
            newStatus === NftMintStatus.FAILED ? `Failed in state: ${input.nmkrState}` : undefined,
        },
        tx,
      );

      if (updated.orderItem?.productId) {
        // const snapshot = await this.orderUseCase.calculateInventory(
        //   ctx,
        //   updated.orderItem.productId,
        // );
        // logger.info("Inventory snapshot", {
        //   nftMintId: updated.id,
        //   productId: updated.orderItem.productId,
        //   snapshot,
        // });
      }
    });
  }

  private mapNmkrState(state: string): NftMintStatus | null {
    switch (state) {
      case "confirmed":
        return NftMintStatus.SUBMITTED;
      case "finished":
        return NftMintStatus.MINTED;
      case "canceled":
      case "expired":
        return NftMintStatus.FAILED;
      default:
        return null;
    }
  }
}
