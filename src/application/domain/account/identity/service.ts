import { IdentityPlatform, Prisma, User } from "@prisma/client";
import { auth } from "@/infrastructure/libs/firebase";
import { IUserRepository } from "@/application/domain/account/user/data/interface";
import { IIdentityRepository } from "@/application/domain/account/identity/data/interface";
import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";

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

  async linkPhoneIdentity(
    ctx: IContext,
    userId: string,
    phoneUid: string,
    tx: Prisma.TransactionClient,
  ) {
    return this.userRepository.update(
      ctx,
      userId,
      {
        identities: {
          create: { uid: phoneUid, platform: IdentityPlatform.PHONE },
        },
      },
      tx,
    );
  }

  async findUserByIdentity(ctx: IContext, uid: string): Promise<User | null> {
    const identity = await this.identityRepository.find(uid);
    if (identity) {
      const user = await this.userRepository.find(ctx, identity.userId);
      return user;
    }
    return null;
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
