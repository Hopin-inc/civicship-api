import { IdentityPlatform, Prisma, User } from "@prisma/client";
import { auth } from "@/libs/firebase";
import UserRepository from "@/domains/user/repository";
import IdentityRepository from "@/domains/user/identity/repository";

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
