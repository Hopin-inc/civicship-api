import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { container } from "tsyringe";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { messagingApi, middleware, MiddlewareConfig } from "@line/bot-sdk";

export async function createLineClientAndMiddleware(communityId: string) {
  const issuer = new PrismaClientIssuer();
  const ctx = { issuer } as IContext;

  const configService = container.resolve(CommunityConfigService);
  const { channelSecret, accessToken } = await configService.getLineMessagingConfig(
    ctx,
    communityId,
  );

  const client = new messagingApi.MessagingApiClient({ channelAccessToken: accessToken });
  const mw = middleware({ channelSecret } satisfies MiddlewareConfig);

  return { client, middleware: mw };
}
