import { CommunityPortalConfig, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaCommunityPortalConfigDetail } from "@/application/domain/account/community/config/portal/data/type";

export default interface ICommunityPortalConfigRepository {
  getPortalConfig(ctx: IContext, communityId: string): Promise<CommunityPortalConfig | null>;

  upsert(
    ctx: IContext,
    args: Prisma.CommunityPortalConfigUpsertArgs,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaCommunityPortalConfigDetail>;
}
