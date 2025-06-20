import { IContext } from "@/types/server";
import { CommunityFirebaseConfig, CommunityLineConfig } from "@prisma/client";
import ICommunityConfigRepository from "@/application/domain/account/community/config/data/interface";
import { injectable } from "tsyringe";

@injectable()
export default class CommunityConfigRepository implements ICommunityConfigRepository {
  async getFirebaseConfig(ctx: IContext, communityId: string): Promise<CommunityFirebaseConfig | null> {
    return await ctx.issuer.public(ctx, async (tx) => {
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
}
