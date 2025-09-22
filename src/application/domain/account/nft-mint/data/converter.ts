import { Prisma, NftMintStatus } from '@prisma/client';

export interface NftMintCreateData {
  orderItemId: string;
  nftWalletId: string;
  status?: NftMintStatus;
}

export interface NftMintUpdateData {
  status?: NftMintStatus;
  txHash?: string;
  error?: string;
}

export default class NftMintConverter {
  static toPrismaCreateInput(data: NftMintCreateData): Prisma.NftMintCreateInput {
    return {
      status: data.status || 'QUEUED',
      orderItem: {
        connect: { id: data.orderItemId },
      },
      nftWallet: {
        connect: { id: data.nftWalletId },
      },
    };
  }

  static toPrismaUpdateInput(data: NftMintUpdateData): Prisma.NftMintUpdateInput {
    const updateData: Prisma.NftMintUpdateInput = {};

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.txHash !== undefined) {
      updateData.txHash = data.txHash;
    }

    if (data.error !== undefined) {
      updateData.error = data.error;
    }

    return updateData;
  }
}
