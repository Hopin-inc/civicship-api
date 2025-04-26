import { IContext } from "@/types/server";
import { GqlCurrentUserPayload, GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityConverter from "@/application/domain/account/user/identity/data/converter";
import IdentityService from "@/application/domain/account/user/identity/service";
import IdentityPresenter from "@/application/domain/account/user/identity/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import MembershipService from "@/application/domain/account/membership/service";
import WalletService from "@/application/domain/account/wallet/service";
import ImageService from "@/application/domain/content/image/service";

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
    console.debug({ ctx, data, image });
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
    await IdentityService.deleteFirebaseAuthUser(uid, context.tenantId);
    return IdentityPresenter.delete(user);
  }
}
