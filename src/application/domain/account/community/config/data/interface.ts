import {
  CommunityFirebaseConfig,
  CommunityLineConfig,
  CommunityLineRichMenuConfig,
  LineRichMenuType,
} from "@prisma/client";
import { IContext } from "@/types/server";

export default interface ICommunityConfigRepository {
  getFirebaseConfig(ctx: IContext, communityId: string | null): Promise<CommunityFirebaseConfig | null>;
  getLineConfig(ctx: IContext, communityId: string | null): Promise<CommunityLineConfig | null>;
  getLineRichMenuByType(
    ctx: IContext,
    communityId: string | null,
    type: LineRichMenuType,
  ): Promise<CommunityLineRichMenuConfig | null>;
}
