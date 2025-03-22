import { IContext } from "@/types/server";
import { GqlCurrentUserPayload, GqlMutationUserSignUpArgs } from "@/types/graphql";
import IdentityConverter from "@/application/user/identity/data/converter";
import IdentityService from "@/application/user/identity/service";
import IdentityPresenter from "@/application/user/identity/presenter";
import UserService from "@/application/user/service";
import OnboardingService from "@/application/onboarding/service";
import { Todo, TransactionReason } from "@prisma/client";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import MembershipService from "@/application/membership/service";
import WalletService from "@/application/membership/wallet/service";
import { initialCommunityId, OnboardingTodoPoints } from "@/consts/utils";
import TransactionService from "@/application/transaction/service";

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
        const onboarding = await OnboardingService.findOnboardingTodoOrThrow(
          ctx,
          user.id,
          Todo.PROFILE,
          tx,
        );

        const reward = OnboardingTodoPoints.PROFILE;
        const { fromWalletId, toWalletId } = await WalletService.validateCommunityMemberTransfer(
          ctx,
          tx,
          initialCommunityId,
          user.id,
          reward,
          TransactionReason.ONBOARDING,
        );

        await TransactionService.giveOnboardingPoint(
          ctx,
          {
            fromWalletId,
            fromPointChange: -reward,
            toWalletId,
            toPointChange: reward,
          },
          tx,
        );

        await OnboardingService.setDone(ctx, onboarding.id, tx);
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
