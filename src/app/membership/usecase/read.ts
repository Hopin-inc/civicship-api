import {
  GqlQueryMembershipsArgs,
  GqlQueryMembershipArgs,
  GqlMembershipsConnection,
  GqlMembership,
  GqlCommunity,
  GqlCommunityMembershipsArgs,
  GqlUserMembershipsArgs,
  GqlUser,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import MembershipUtils from "@/app/membership/utils";
import MembershipOutputFormat from "@/presen/graphql/dto/membership/output";
import MembershipService from "@/app/membership/service";

export default class MembershipReadUseCase {
  static async visitorBrowseMemberships(
    { filter, sort, cursor, first }: GqlQueryMembershipsArgs,
    ctx: IContext,
  ): Promise<GqlMembershipsConnection> {
    return MembershipUtils.fetchMembershipsCommon(ctx, {
      cursor,
      sort,
      filter,
      first,
    });
  }

  static async visitorBrowseMembershipsByCommunity(
    { id }: GqlCommunity,
    { first, cursor }: GqlCommunityMembershipsArgs,
    ctx: IContext,
  ): Promise<GqlMembershipsConnection> {
    return MembershipUtils.fetchMembershipsCommon(ctx, {
      cursor,
      filter: { communityId: id },
      first,
    });
  }

  static async visitorBrowseMembershipsByUser(
    { id }: GqlUser,
    { first, cursor }: GqlUserMembershipsArgs,
    ctx: IContext,
  ): Promise<GqlMembershipsConnection> {
    return MembershipUtils.fetchMembershipsCommon(ctx, {
      cursor,
      filter: { userId: id },
      first,
    });
  }

  static async visitorViewMembership(
    { userId, communityId }: GqlQueryMembershipArgs,
    ctx: IContext,
  ): Promise<GqlMembership | null> {
    const membership = await MembershipService.findMembership(ctx, userId, communityId);
    return membership ? MembershipOutputFormat.get(membership) : null;
  }
}
