import {
  GqlMutationUserUpdateMyProfileArgs,
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
  GqlUser,
  GqlUsersConnection,
  GqlUserUpdateProfilePayload,
} from "@/types/graphql";
import UserService from "@/application/user/service";
import UserPresenter from "@/application/user/presenter";
import { IContext } from "@/types/server";
import { clampFirst, getCurrentUserId } from "@/application/utils";
import OnboardingService from "@/application/onboarding/service";
import { Todo, TransactionReason } from "@prisma/client";
import WalletService from "@/application/membership/wallet/service";
import { initialCommunityId, OnboardingTodoPoints } from "@/consts/utils";
import TransactionService from "@/application/transaction/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export default class UserUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseCommunityMembers(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryUsersArgs,
  ): Promise<GqlUsersConnection> {
    const take = clampFirst(first);
    const data = await UserService.fetchCommunityMembers(ctx, { cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const users: GqlUser[] = data.slice(0, take).map((record) => {
      return UserPresenter.get(record);
    });
    return UserPresenter.query(users, hasNextPage);
  }

  static async visitorViewMember(ctx: IContext, { id }: GqlQueryUserArgs): Promise<GqlUser | null> {
    const user = await UserService.findUser(ctx, id);
    if (!user) {
      return null;
    }

    return UserPresenter.get(user);
  }

  static async userUpdateProfile(
    ctx: IContext,
    args: GqlMutationUserUpdateMyProfileArgs,
  ): Promise<GqlUserUpdateProfilePayload> {
    const currentUserId = getCurrentUserId(ctx);

    const user = await this.issuer.public(ctx, async (tx) => {
      const user = await UserService.updateProfile(ctx, args, tx);

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
          currentUserId,
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

    return UserPresenter.updateProfile(user);
  }
}
