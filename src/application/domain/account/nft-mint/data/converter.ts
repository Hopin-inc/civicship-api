import { injectable } from "tsyringe";
import { Prisma, NftMintStatus } from "@prisma/client";

@injectable()
export default class NftMintConverter {
  buildMintCreate(p: {
    policyId: string;
    assetName: string;
    sequenceNum: number;
    receiver: string;
    nftWalletId: string;
  }): Prisma.NftMintCreateInput {
    return {
      policyId: p.policyId,
      assetName: p.assetName,
      sequenceNum: p.sequenceNum,
      receiver: p.receiver,
      status: NftMintStatus.QUEUED,
      nftWallet: { connect: { id: p.nftWalletId } },
    };
  }

  buildMarkMinted(p: { txHash: string }): Prisma.NftMintUpdateInput {
    return { status: NftMintStatus.MINTED, txHash: p.txHash, error: null };
  }

  buildMarkFailed(p: { error: string }): Prisma.NftMintUpdateInput {
    return { status: NftMintStatus.FAILED, error: p.error };
  }
}
