import {
  CommunityLineConfig,
  CommunityLineRichMenuConfig,
  LineRichMenuType,
} from "@prisma/client";
import { IContext } from "@/types/server";

export default interface ICommunityConfigRepository {
  getLineConfig(ctx: IContext, communityId: string): Promise<CommunityLineConfig | null>;
  getLineRichMenuByType(
    ctx: IContext,
    communityId: string,
    type: LineRichMenuType,
  ): Promise<CommunityLineRichMenuConfig | null>;
}
