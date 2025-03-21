import { IContext } from "@/types/server";
import { GqlCurrentUserPayload, GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityConverter from "@/application/user/identity/data/converter";
import IdentityService from "@/application/user/identity/service";
import IdentityPresenter from "@/application/user/identity/presenter";
import UserService from "@/application/user/service";
import OnboardingService from "@/application/onboarding/service";
import { Todo } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import MembershipService from "@/application/membership/service";
import WalletService from "@/application/membership/wallet/service";
import { initialCommunityId } from "@/consts/utils";

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
    const data = IdentityConverter.create(args);
    const user = await IdentityService.createUserAndIdentity(data, ctx.uid, ctx.platform);

    const res = await this.issuer.public(ctx, async (tx) => {
      await MembershipService.joinIfNeeded(ctx, user.id, initialCommunityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, user.id, initialCommunityId, tx);
      await OnboardingService.createOnboardingTodos(ctx, user.id, tx);

      const isProfileComplete = await UserService.hasProfileCompleted(user);
      const isWIP = await OnboardingService.hasWipOnboardingTodo(ctx, user.id, Todo.PROFILE);

      if (isProfileComplete && isWIP) {
        // TODO: Onboarding報酬ポイントを付与する処理をここに
      }

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
