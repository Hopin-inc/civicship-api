import { IdentityPlatform, Prisma, User } from "@prisma/client";
import { auth } from "@/infra/libs/firebase";
import UserRepository from "@/infra/prisma/repositories/user";
import IdentityRepository from "@/infra/prisma/repositories/user/identity";

export default class IdentityService {
  static async createUserAndIdentity(
    data: Prisma.UserCreateInput,
    uid: string,
    platform: IdentityPlatform,
  ) {
    return UserRepository.createWithIdentity({
      ...data,
      identities: {
        create: { uid, platform },
      },
    });
  }

  static async deleteUserAndIdentity(uid: string): Promise<User | null> {
    const identity = await IdentityRepository.find(uid);
    if (identity) {
      return UserRepository.deleteWithIdentity(identity.userId);
    } else {
      return null;
    }
  }

  static async deleteFirebaseAuthUser(uid: string): Promise<void> {
    return auth.deleteUser(uid);
  }
}
