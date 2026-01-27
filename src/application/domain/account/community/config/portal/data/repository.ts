import { IContext } from "@/types/server";
import { CommunityPortalConfig, Prisma } from "@prisma/client";
import ICommunityPortalConfigRepository from "@/application/domain/account/community/config/portal/data/interface";
import { injectable } from "tsyringe";
import {
  communityPortalConfigSelect,
  PrismaCommunityPortalConfigDetail,
} from "@/application/domain/account/community/config/portal/data/type";

@injectable()
export default class CommunityPortalConfigRepository implements ICommunityPortalConfigRepository {
  async getPortalConfig(ctx: IContext, communityId: string): Promise<CommunityPortalConfig | null> {
    return await ctx.issuer.public(ctx, async (tx) => {
      const result = await tx.communityConfig.findUnique({
        where: { communityId },
        include: { portalConfig: true },
      });
      return result?.portalConfig ?? null;
    });
  }

  async upsert(
    ctx: IContext,
    args: Prisma.CommunityPortalConfigUpsertArgs,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaCommunityPortalConfigDetail> {
    return tx.communityPortalConfig.upsert({
      ...args,
      select: communityPortalConfigSelect,
    });
  }
}
