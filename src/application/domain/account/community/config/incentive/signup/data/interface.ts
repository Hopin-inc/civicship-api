import { IContext } from "@/types/server";
import { Prisma, CommunitySignupBonusConfig } from "@prisma/client";

export default interface ICommunitySignupBonusConfigRepository {
  get(
    ctx: IContext,
    communityId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<CommunitySignupBonusConfig | null>;

  upsert(
    ctx: IContext,
    communityId: string,
    data: Prisma.CommunitySignupBonusConfigUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<CommunitySignupBonusConfig>;
}
