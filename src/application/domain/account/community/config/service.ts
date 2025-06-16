import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";
import { inject, injectable } from "tsyringe";
import ICommunityConfigRepository from "@/application/domain/account/community/config/data/interface";

@injectable()
export default class CommunityConfigService {
  constructor(
    @inject("CommunityConfigRepository")
    private readonly repository: ICommunityConfigRepository,
  ) {}

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
  }> {
    const config = await this.repository.getLineConfig(ctx, communityId);
    if (!config?.liffId || !config?.liffBaseUrl) {
      throw new NotFoundError("LIFF Config is incomplete", { communityId });
    }
    return {
      liffId: config.liffId,
      liffBaseUrl: config.liffBaseUrl,
    };
  }
}
