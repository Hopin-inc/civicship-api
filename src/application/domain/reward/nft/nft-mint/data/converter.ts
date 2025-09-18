import { injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";

@injectable()
export default class NftMintConverter {
  buildMintCreate(p: {
    orderItemId: string;
    nftWalletId: string;
    sequenceNum: number;
    receiver: string;
  }): Prisma.NftMintCreateInput {
    return {
      status: NftMintStatus.QUEUED,
      nftWallet: { connect: { id: p.nftWalletId } },
      orderItem: { connect: { id: p.orderItemId } },
    };
  }

  buildMarkSubmitted(p: { txHash: string }): Prisma.NftMintUpdateInput {
    return { status: NftMintStatus.MINTED, txHash: p.txHash, error: null };
  }

  buildMarkMinted(p: { txHash: string }): Prisma.NftMintUpdateInput {
    return { status: NftMintStatus.MINTED, txHash: p.txHash, error: null };
  }

  buildMarkFailed(p: { error: string }): Prisma.NftMintUpdateInput {
    return { status: NftMintStatus.FAILED, error: p.error };
  }
}
