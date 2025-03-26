import { IContext } from "@/types/server";
import { GqlCurrentUserPayload, GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityConverter from "@/application/domain/user/identity/data/converter";
import IdentityService from "@/application/domain/user/identity/service";
import IdentityPresenter from "@/application/domain/user/identity/presenter";
import UserService from "@/application/domain/user/service";
import OnboardingService from "@/application/domain/onboarding/service";
import { Todo } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import MembershipService from "@/application/domain/membership/service";
import WalletService from "@/application/domain/membership/wallet/service";
import { initialCommunityId, OnboardingTodoPoints } from "@/consts/utils";
import { runOnboardingReward } from "@/application/domain/utils";

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

      if (isProfileComplete) {
        await runOnboardingReward(ctx, user.id, Todo.PROFILE, OnboardingTodoPoints.PROFILE, tx);
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
