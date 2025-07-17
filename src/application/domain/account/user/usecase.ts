import {
  GqlMutationUserUpdateMyProfileArgs,
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
  GqlUser,
  GqlUsersConnection,
  GqlUserUpdateProfilePayload,
} from "@/types/graphql";
import UserService from "@/application/domain/account/user/service";
import UserPresenter from "@/application/domain/account/user/presenter";
import { IContext } from "@/types/server";
import { clampFirst } from "@/application/domain/utils";
import { inject, injectable } from "tsyringe";

@injectable()
export default class UserUseCase {
  constructor(@inject("UserService") private readonly service: UserService) {}

  async visitorBrowseCommunityMembers(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryUsersArgs,
  ): Promise<GqlUsersConnection> {
    const take = clampFirst(first);
    const data = await this.service.fetchCommunityMembers(ctx, { cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const users: GqlUser[] = data.slice(0, take).map(UserPresenter.get);
    return UserPresenter.query(users, hasNextPage, cursor);
  }

  async visitorViewMember(ctx: IContext, { id }: GqlQueryUserArgs): Promise<GqlUser | null> {
    const user = await this.service.findUser(ctx, id);
    return user ? UserPresenter.get(user) : null;
  }

  async userUpdateProfile(
    ctx: IContext,
    args: GqlMutationUserUpdateMyProfileArgs,
  ): Promise<GqlUserUpdateProfilePayload> {
    const user = await ctx.issuer.public(ctx, async (tx) => {
      return await this.service.updateProfile(ctx, args, tx);
    });

    return UserPresenter.updateProfile(user);
  }

  //TODO あとでドメイン分割修正の必要性あり
  async canCurrentUserViewPhoneNumber(
    ctx: IContext,
    targetUserId: string,
    viewerUserId: string,
  ): Promise<boolean> {
    if (viewerUserId === targetUserId) return true;

    return await ctx.issuer.internal(async (tx) => {
      const hasReservationInTheirOpportunity = await tx.reservation.findFirst({
        where: {
          createdBy: viewerUserId,
          opportunitySlot: { opportunity: { createdByUser: { id: targetUserId } } },
        },
        select: { id: true },
      });
      if (hasReservationInTheirOpportunity) return true;

      const isMyParticipant = await tx.opportunity.findFirst({
        where: {
          createdBy: viewerUserId,
          slots: {
            some: {
              reservations: {
                some: {
                  createdBy: targetUserId,
                },
              },
            },
          },
        },
        select: { id: true },
      });
      return !!isMyParticipant;
    });
  }
}
