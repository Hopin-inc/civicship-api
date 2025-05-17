import { PrismaIdentityDetail } from "@/application/domain/account/identity/data/type";
import { Prisma } from "@prisma/client";

export interface IIdentityRepository {
  find(uid: string): Promise<PrismaIdentityDetail | null>;
  update(uid: string, data: Prisma.IdentityUpdateInput): Promise<PrismaIdentityDetail>;
}
