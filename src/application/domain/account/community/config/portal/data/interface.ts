import { CommunityPortalConfig } from "@prisma/client";
import { IContext } from "@/types/server";

export default interface ICommunityPortalConfigRepository {
  getPortalConfig(ctx: IContext, communityId: string): Promise<CommunityPortalConfig | null>;
}
