import { IContext } from "@/types/server";
import { CommunityPortalConfig, Prisma } from "@prisma/client";
import ICommunityPortalConfigRepository from "@/application/domain/account/community/config/portal/data/interface";
import { injectable } from "tsyringe";

@injectable()
export default class CommunityPortalConfigRepository implements ICommunityPortalConfigRepository {
  async getPortalConfig(
    ctx: IContext,
    communityId: string,
  ): Promise<CommunityPortalConfig | null> {
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
    communityId: string,
    data: Prisma.CommunityPortalConfigCreateWithoutConfigInput,
    tx: Prisma.TransactionClient,
  ): Promise<CommunityPortalConfig> {
    const result = await tx.communityConfig.update({
      where: { communityId },
      data: {
        portalConfig: {
          upsert: { create: data, update: data },
        },
      },
      include: { portalConfig: true },
    });
    return result.portalConfig!;
  }
}
