import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";
import { inject, injectable } from "tsyringe";
import ICommunityConfigRepository from "@/application/domain/account/community/config/data/interface";
import { LineRichMenuType } from "@prisma/client";
import logger from "@/infrastructure/logging";

@injectable()
export default class CommunityConfigService {
  constructor(
    @inject("CommunityConfigRepository")
    private readonly repository: ICommunityConfigRepository,
  ) { }

  async getFirebaseTenantId(ctx: IContext, communityId: string): Promise<string> {
    const config = await this.repository.getFirebaseConfig(ctx, communityId);
    if (!config?.tenantId) {
      throw new NotFoundError("Firebase tenantId not found", { communityId });
    }
    return config.tenantId;
  }

  async getLineMessagingConfig(
    ctx: IContext,
    communityId: string,
  ): Promise<{
    channelId: string;
    channelSecret: string;
    accessToken: string;
  }> {
    const config = await this.repository.getLineConfig(ctx, communityId);
    if (!config?.channelId || !config?.channelSecret || !config?.accessToken) {
      throw new NotFoundError("LINE Messaging Config is incomplete", { communityId });
    }
    return {
      channelId: config.channelId,
      channelSecret: config.channelSecret,
      accessToken: config.accessToken,
    };
  }

  async getLiffConfig(
    ctx: IContext,
    communityId: string,
  ): Promise<{
    liffId: string;
    liffBaseUrl: string;
    channelId: string;
  }> {
    const config = await this.repository.getLineConfig(ctx, communityId);
    if (!config?.liffId || !config?.liffBaseUrl || !config?.channelId) {
      throw new NotFoundError("LIFF Config is incomplete", { communityId });
    }
    return {
      liffId: config.liffId,
      liffBaseUrl: config.liffBaseUrl,
      channelId: config.channelId,
    };
  }

  async getLineRichMenuIdByType(
    ctx: IContext,
    communityId: string,
    type: LineRichMenuType,
  ): Promise<string | null> {
    try {
      const menu = await this.repository.getLineRichMenuByType(ctx, communityId, type);

      if (!menu) {
        logger.warn("getLineRichMenuIdByType: menu not found in database", {
          communityId,
          type,
        });
        return null;
      }

      if (!menu.richMenuId) {
        logger.warn("getLineRichMenuIdByType: richMenuId is null or empty", {
          communityId,
          type,
          menuId: menu.id,
        });
        return null;
      }

      return menu.richMenuId;
    } catch (error) {
      logger.error("getLineRichMenuIdByType: database query failed", {
        communityId,
        type,
        err: error,
      });
      return null;
    }
  }
}
