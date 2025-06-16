import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { container } from "tsyringe";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { messagingApi, middleware, MiddlewareConfig } from "@line/bot-sdk";

export async function createLineClientAndMiddleware(communityId: string) {
  const [client, mw] = await Promise.all([
    createLineClient(communityId),
    createLineMiddleware(communityId),
  ]);
  return { client, middleware: mw };
}

export async function createLineClient(
  communityId: string,
): Promise<messagingApi.MessagingApiClient> {
  const issuer = new PrismaClientIssuer();
  const ctx = { issuer } as IContext;

  const configService = container.resolve(CommunityConfigService);
  const { accessToken } = await configService.getLineMessagingConfig(ctx, communityId);

  return new messagingApi.MessagingApiClient({ channelAccessToken: accessToken });
}

export async function createLineMiddleware(
  communityId: string,
): Promise<ReturnType<typeof middleware>> {
  const issuer = new PrismaClientIssuer();
  const ctx = { issuer } as IContext;

  const configService = container.resolve(CommunityConfigService);
  const { channelSecret } = await configService.getLineMessagingConfig(ctx, communityId);

  return middleware({ channelSecret } satisfies MiddlewareConfig);
}
