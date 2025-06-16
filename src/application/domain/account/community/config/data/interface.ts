import { FirebaseConfig, LineConfig } from "@prisma/client";
import { IContext } from "@/types/server";

export default interface ICommunityConfigRepository {
  getFirebaseConfig(ctx: IContext, communityId: string): Promise<FirebaseConfig | null>;
  getLineConfig(ctx: IContext, communityId: string): Promise<LineConfig | null>;
}
