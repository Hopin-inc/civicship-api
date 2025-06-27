import {
  CommunityFirebaseConfig,
  CommunityLineConfig,
  CommunityLineRichMenuConfig,
  LineRichMenuType,
} from "@prisma/client";
import { IContext } from "@/types/server";

export default interface ICommunityConfigRepository {
  getFirebaseConfig(ctx: IContext, communityId: string): Promise<CommunityFirebaseConfig | null>;
  getLineConfig(ctx: IContext, communityId: string): Promise<CommunityLineConfig | null>;
  getLineRichMenuByType(
    ctx: IContext,
    communityId: string,
    type: LineRichMenuType,
  ): Promise<CommunityLineRichMenuConfig | null>;
}
