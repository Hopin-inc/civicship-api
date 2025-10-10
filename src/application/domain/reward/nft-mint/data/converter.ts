import { injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";

@injectable()
export default class NftMintConverter {
  buildMintCreate(p: {
    orderItemId: string;
    nftInstanceId: string;
  }): Prisma.NftMintCreateInput {
    return {
      status: NftMintStatus.QUEUED,
      retryCount: 0,
      orderItem: { connect: { id: p.orderItemId } },
      nftInstance: { connect: { id: p.nftInstanceId } },
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
