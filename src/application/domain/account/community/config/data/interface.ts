import {
  CommunityFirebaseConfig,
  CommunityLineConfig,
  CommunityLineRichMenuConfig,
  LineRichMenuType,
} from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export default interface ICommunityConfigRepository {
  getFirebaseConfig(issuer: PrismaClientIssuer, communityId: string): Promise<CommunityFirebaseConfig | null>;
  getLineConfig(ctx: IContext, communityId: string): Promise<CommunityLineConfig | null>;
  getLineRichMenuByType(
    ctx: IContext,
    communityId: string,
    type: LineRichMenuType,
  ): Promise<CommunityLineRichMenuConfig | null>;
}
