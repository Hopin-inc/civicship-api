import { injectable } from "tsyringe";
import { Prisma } from "@prisma/client";

@injectable()
export default class NftMintConverter {
  buildMintCreate(p: {
    policyId: string;
    assetName: string;
    receiver: string;
  }): Prisma.NftMintCreateInput {
    return {
      policyId: p.policyId,
      assetName: p.assetName,
      receiver: p.receiver,
      status: "QUEUED",
    };
  }

  buildMarkMinted(p: { txHash: string }): Prisma.NftMintUpdateInput {
    return { status: "MINTED", txHash: p.txHash, error: null };
  }

  buildMarkFailed(p: { error: string }): Prisma.NftMintUpdateInput {
    return { status: "FAILED", error: p.error };
  }
}
