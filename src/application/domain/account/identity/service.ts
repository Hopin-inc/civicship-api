import { IdentityPlatform, Prisma, User } from "@prisma/client";
import { auth } from "@/infrastructure/libs/firebase";
import { IUserRepository } from "@/application/domain/account/user/data/interface";
import { IIdentityRepository } from "@/application/domain/account/identity/data/interface";
import { injectable, inject } from "tsyringe";

@injectable()
export default class IdentityService {
  constructor(
    @inject("UserRepository") private readonly userRepository: IUserRepository,
    @inject("IdentityRepository") private readonly identityRepository: IIdentityRepository,
  ) {}

  async createUserAndIdentity(
    data: Prisma.UserCreateInput,
    uid: string,
    platform: IdentityPlatform,
  ) {
    return this.userRepository.create({
      ...data,
      identities: {
        create: { uid, platform },
      },
    });
  }

  async deleteUserAndIdentity(uid: string): Promise<User | null> {
    const identity = await this.identityRepository.find(uid);
    if (identity) {
      return this.userRepository.delete(identity.userId);
    } else {
      return null;
    }
  }

  async deleteFirebaseAuthUser(uid: string, tenantId: string): Promise<void> {
    const tenantedAuth = auth.tenantManager().authForTenant(tenantId);
    return tenantedAuth.deleteUser(uid);
  }
}
