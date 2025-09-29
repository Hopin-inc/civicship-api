import { injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";

@injectable()
export default class NftMintConverter {
  buildMintCreate(p: { orderItemId: string; nftWalletId: string }): Prisma.NftMintCreateInput {
    return {
      status: NftMintStatus.QUEUED,
      nftWallet: { connect: { id: p.nftWalletId } },
      orderItem: { connect: { id: p.orderItemId } },
    };
  }

  buildStatusUpdate(
    newStatus: NftMintStatus,
    txHash?: string,
    error?: string,
  ): Prisma.NftMintUpdateInput {
    return {
      status: newStatus,
      txHash: txHash ?? undefined,
      error: error ?? null,
    };
  }

  mintedByProduct(productId: string): Prisma.NftMintWhereInput {
    return {
      status: NftMintStatus.MINTED,
      orderItem: { productId },
    };
  }
}
