import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class NFTWalletService {
  async createOrUpdateWalletAddress(
    ctx: IContext,
    userId: string,
    walletAddress: string,
    tx: Prisma.TransactionClient,
  ) {
    return tx.nFTWallet.upsert({
      where: { userId },
      update: { walletAddress },
      create: {
        userId,
        walletAddress,
      },
    });
  }

  async findWalletByUserId(
    ctx: IContext,
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.nFTWallet.findUnique({
        where: { userId },
      });
    }
    
    const { PrismaClientIssuer } = await import("@/infrastructure/prisma/client");
    const issuer = new PrismaClientIssuer();
    return issuer.internal(async (client) => {
      return client.nFTWallet.findUnique({
        where: { userId },
      });
    });
  }
}
