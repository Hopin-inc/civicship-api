import { CommunityFirebaseConfig, CommunityLineConfig } from "@prisma/client";
import { IContext } from "@/types/server";

export default interface ICommunityConfigRepository {
  getFirebaseConfig(ctx: IContext, communityId: string): Promise<CommunityFirebaseConfig | null>;
  getLineConfig(ctx: IContext, communityId: string): Promise<CommunityLineConfig | null>;
}
