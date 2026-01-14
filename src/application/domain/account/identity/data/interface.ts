import { PrismaIdentityDetail } from "@/application/domain/account/identity/data/type";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export interface IIdentityRepository {
  find(uid: string): Promise<PrismaIdentityDetail | null>;
  findByUidAndCommunity(
    uid: string,
    platform: import("@prisma/client").IdentityPlatform,
    communityId: string | null,
  ): Promise<PrismaIdentityDetail | null>;
  create(ctx: IContext, data: Prisma.IdentityCreateInput, tx?: Prisma.TransactionClient): Promise<PrismaIdentityDetail | null>;
  update(uid: string, data: Prisma.IdentityUpdateInput): Promise<PrismaIdentityDetail>;
}
