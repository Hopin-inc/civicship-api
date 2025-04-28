import { IContext } from "@/types/server";
import { GqlCurrentUserPayload, GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityConverter from "@/application/domain/account/identity/data/converter";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityPresenter from "@/application/domain/account/identity/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import MembershipService from "@/application/domain/account/membership/service";
import WalletService from "@/application/domain/account/wallet/service";
import ImageService from "@/application/domain/content/image/service";

export default class IdentityUseCase {
  constructor(
    private readonly issuer: PrismaClientIssuer,
    private readonly identityService: IdentityService,
    private readonly membershipService: MembershipService,
    private readonly walletService: WalletService,
    private readonly imageService: ImageService,
  ) {}

  async userViewCurrentAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    return {
      user: context.currentUser,
    };
  }

  async userCreateAccount(
    ctx: IContext,
    args: GqlMutationUserSignUpArgs,
  ): Promise<GqlCurrentUserPayload> {
    const { data, image } = IdentityConverter.create(args);

    const uploadedImage = image
      ? await this.imageService.uploadPublicImage(image, "users")
      : undefined;

    const user = await this.identityService.createUserAndIdentity(
      {
        ...data,
        image: uploadedImage ? { create: uploadedImage } : undefined,
      },
      ctx.uid,
      ctx.platform,
    );

    const res = await this.issuer.public(ctx, async (tx) => {
      await this.membershipService.joinIfNeeded(ctx, user.id, args.input.communityId, tx);
      await this.walletService.createMemberWalletIfNeeded(ctx, user.id, args.input.communityId, tx);
      return user;
    });

    return IdentityPresenter.create(res);
  }

  async userDeleteAccount(context: IContext): Promise<GqlCurrentUserPayload> {
    const uid = context.uid;
    const user = await this.identityService.deleteUserAndIdentity(uid);
    await this.identityService.deleteFirebaseAuthUser(uid, context.tenantId);
    return IdentityPresenter.delete(user);
  }
}
