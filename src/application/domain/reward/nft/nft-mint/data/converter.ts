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
}
