import { IContext } from "@/types/server";
import {
  CommunityFirebaseConfig,
  CommunityLineConfig,
  CommunityLineRichMenuConfig,
  LineRichMenuType,
} from "@prisma/client";
import ICommunityConfigRepository from "@/application/domain/account/community/config/data/interface";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class CommunityConfigRepository implements ICommunityConfigRepository {
  async getFirebaseConfig(
    issuer: PrismaClientIssuer,
    communityId: string,
  ): Promise<CommunityFirebaseConfig | null> {
    return await issuer.internal(async (tx) => {
      const result = await tx.communityConfig.findUnique({
        where: { communityId },
        include: { firebaseConfig: true },
      });
      return result?.firebaseConfig ?? null;
    });
  }

  async getLineConfig(ctx: IContext, communityId: string): Promise<CommunityLineConfig | null> {
    return await ctx.issuer.public(ctx, async (tx) => {
      const result = await tx.communityConfig.findUnique({
        where: { communityId },
        include: { lineConfig: true },
      });
      return result?.lineConfig ?? null;
    });
  }

  async getLineRichMenuByType(
    ctx: IContext,
    communityId: string,
    type: LineRichMenuType,
  ): Promise<CommunityLineRichMenuConfig | null> {
    return await ctx.issuer.public(ctx, async (tx) => {
      const config = await tx.communityConfig.findUnique({
        where: { communityId },
        include: {
          lineConfig: true,
        },
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
