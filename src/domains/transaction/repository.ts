import { prismaClient } from "@/prisma/client";
import { refreshMaterializedViewCurrentPoints } from "@prisma/client/sql";
import { Prisma } from "@prisma/client";

export default class TransactionRepository {
  private static db = prismaClient;

  static async refreshStat() {
    return this.db.$queryRawTyped(refreshMaterializedViewCurrentPoints());
  }

  static async transferPoints(
    tx: Prisma.TransactionClient,
    sourceWalletId: string,
    targetWalletId: string,
    points: number,
  ) {
    if (points <= 0) {
      throw new Error("Points to transfer must be greater than zero");
    }

    await tx.transaction.createMany({
      data: [
        {
          from: sourceWalletId,
          fromPointChange: -points,
        },
        {
          to: targetWalletId,
          toPointChange: points,
        },
      ],
    });
  }
}
