import { NftVendor, Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import crypto from "crypto";
import { IContext } from "@/types/server";

export type VendorUserLinkRecord = {
  id: string;
  ref: string;
  vendor: NftVendor;
  userId: string;
};

@injectable()
export default class VendorUserLinkRepository {
  /**
   * (vendor, userId) の link を取得。無ければ生成する。
   * ref は既存があればそのまま (安定ハンドル)、新規時のみ採番する。
   */
  async getOrCreate(
    ctx: IContext,
    vendor: NftVendor,
    userId: string,
    tx: Prisma.TransactionClient,
  ): Promise<VendorUserLinkRecord> {
    return tx.vendorUserLink.upsert({
      where: { vendor_userId: { vendor, userId } },
      update: {},
      create: {
        ref: crypto.randomBytes(32).toString("hex"),
        vendor,
        userId,
      },
      select: { id: true, ref: true, vendor: true, userId: true },
    });
  }

  async findByRef(ctx: IContext, ref: string): Promise<VendorUserLinkRecord | null> {
    return ctx.issuer.internal((tx) =>
      tx.vendorUserLink.findUnique({
        where: { ref },
        select: { id: true, ref: true, vendor: true, userId: true },
      }),
    );
  }
}
