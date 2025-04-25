import { IContext } from "@/types/server";
import { GqlCurrentUserPayload, GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityConverter from "@/application/domain/user/identity/data/converter";
import IdentityService from "@/application/domain/user/identity/service";
import IdentityPresenter from "@/application/domain/user/identity/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import MembershipService from "@/application/domain/membership/service";
import WalletService from "@/application/domain/wallet/service";
import ImageService from "@/application/domain/image/service";

export default class IdentityUseCase {
  private static issuer = new PrismaClientIssuer();

  static async userViewCurrentAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    return {
      user: context.currentUser,
    };
  }

  static async userCreateAccount(
    ctx: IContext,
    args: GqlMutationUserSignUpArgs,
  ): Promise<GqlCurrentUserPayload> {
    const { data, image } = IdentityConverter.create(args);
    const uploadedImage = image ? await ImageService.uploadPublicImage(image, "users") : undefined;
    const user = await IdentityService.createUserAndIdentity(
      {
        ...data,
        image: uploadedImage ? { create: uploadedImage } : undefined,
      },
      ctx.uid,
      ctx.platform,
    );

    const res = await this.issuer.public(ctx, async (tx) => {
      await MembershipService.joinIfNeeded(ctx, user.id, args.input.communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, user.id, args.input.communityId, tx);
      return user;
    });

    return IdentityPresenter.create(res);
  }

  static async userDeleteAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    const uid = context.uid;
    const user = await IdentityService.deleteUserAndIdentity(uid);
    await IdentityService.deleteFirebaseAuthUser(uid);
    return IdentityPresenter.delete(user);
  }
}
