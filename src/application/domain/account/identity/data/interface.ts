import { PrismaIdentityDetail } from "@/application/domain/account/identity/data/type";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export interface IIdentityRepository {
  find(uid: string): Promise<PrismaIdentityDetail | null>;
  create(ctx: IContext, data: Prisma.IdentityCreateInput): Promise<PrismaIdentityDetail | null>;
  update(uid: string, data: Prisma.IdentityUpdateInput): Promise<PrismaIdentityDetail>;
}
