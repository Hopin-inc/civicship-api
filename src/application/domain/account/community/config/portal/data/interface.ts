import { CommunityPortalConfig, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export default interface ICommunityPortalConfigRepository {
  getPortalConfig(ctx: IContext, communityId: string): Promise<CommunityPortalConfig | null>;
  upsert(
    ctx: IContext,
    communityId: string,
    data: Prisma.CommunityPortalConfigCreateWithoutConfigInput,
    tx: Prisma.TransactionClient,
  ): Promise<CommunityPortalConfig>;
}
