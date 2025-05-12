import { PrismaIdentityDetail } from "@/application/domain/account/identity/data/type";

export interface IIdentityRepository {
  find(uid: string): Promise<PrismaIdentityDetail | null>;
}
