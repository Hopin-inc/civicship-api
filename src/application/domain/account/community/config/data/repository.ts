import { IContext } from "@/types/server";
import {
  CommunityFirebaseConfig,
  CommunityLineConfig,
  CommunityLineRichMenuConfig,
  LineRichMenuType,
} from "@prisma/client";
import ICommunityConfigRepository from "@/application/domain/account/community/config/data/interface";
import { injectable } from "tsyringe";

@injectable()
export default class CommunityConfigRepository implements ICommunityConfigRepository {
  async getFirebaseConfig(
    ctx: IContext,
    communityId: string | null,
  ): Promise<CommunityFirebaseConfig | null> {
    return await ctx.issuer.public(ctx, async (tx) => {
      const result = await tx.communityConfig.findFirst({
        where: { communityId },
        include: { firebaseConfig: true },
      });
      return result?.firebaseConfig ?? null;
    });
  }

  async getLineConfig(ctx: IContext, communityId: string | null): Promise<CommunityLineConfig | null> {
    return await ctx.issuer.public(ctx, async (tx) => {
      // If communityId is null or 'integrated', use the 'integrated' LINE config.
      // Otherwise, use the community-specific LINE config.
      const targetCommunityId = (communityId === "integrated" || communityId === null) ? null : communityId;

      const result = await tx.communityConfig.findFirst({
        where: { communityId: targetCommunityId },
        include: { lineConfig: true },
      });
      return result?.lineConfig ?? null;
    });
  }

  async getLineRichMenuByType(
    ctx: IContext,
    communityId: string | null,
    type: LineRichMenuType,
  ): Promise<CommunityLineRichMenuConfig | null> {
    return await ctx.issuer.public(ctx, async (tx) => {
      // Rich menus should be retrieved based on community-specific config.
      const targetCommunityId = (communityId === "integrated" || communityId === null) ? null : communityId;

      const config = await tx.communityConfig.findFirst({
        where: { communityId: targetCommunityId },
        include: { lineConfig: true },
      });
      if (!config?.lineConfig) return null;

      return tx.communityLineRichMenuConfig.findUnique({
        where: {
          configId_type: {
            configId: config.lineConfig.id,
            type,
          },
        },
      });
    });
  }
}
