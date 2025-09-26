import {
  GqlMembershipsConnection,
  GqlMembership,
  GqlMembershipInviteSuccess,
  GqlMembershipSetInvitationStatusSuccess,
  GqlMembershipWithdrawSuccess,
  GqlMembershipSetRoleSuccess,
  GqlMembershipRemoveSuccess,
} from "@/types/graphql";
import {
  PrismaMembership,
  PrismaMembershipDetail,
} from "@/application/domain/account/membership/data/type";

export default class MembershipPresenter {
  static query(
    r: PrismaMembershipDetail[],
    hasNextPage: boolean,
    cursor?: string,
  ): GqlMembershipsConnection {
    return {
      __typename: "MembershipsConnection",
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: r[0]?.userId + "_" + r[0]?.communityId,
        endCursor: r.length
          ? r[r.length - 1].userId + "_" + r[r.length - 1].communityId
          : undefined,
      },
      edges: r.map((edge) => ({
        cursor: edge.userId + "_" + edge.communityId,
        node: this.get(edge),
      })),
    };
  }

  static get(r: PrismaMembershipDetail): GqlMembership {
    return {
      __typename: "Membership",
      ...r,
    };
  }

  static invite(r: Omit<PrismaMembership, "user">): GqlMembershipInviteSuccess {
    return {
      __typename: "MembershipInviteSuccess",
      membership: r,
    };
  }

  static setInvitationStatus(
    r: Omit<PrismaMembership, "user">,
  ): GqlMembershipSetInvitationStatusSuccess {
    return {
      __typename: "MembershipSetInvitationStatusSuccess",
      membership: r,
    };
  }

  static withdraw(r: Omit<PrismaMembership, "user">): GqlMembershipWithdrawSuccess {
    const { userId, communityId } = r;
    return {
      __typename: "MembershipWithdrawSuccess",
      userId,
      communityId,
    };
  }

  static remove(r: Omit<PrismaMembership, "user">): GqlMembershipRemoveSuccess {
    const { userId, communityId } = r;
    return {
      __typename: "MembershipRemoveSuccess",
      userId,
      communityId,
    };
  }

  static setRole(r: Omit<PrismaMembership, "user">): GqlMembershipSetRoleSuccess {
    return {
      __typename: "MembershipSetRoleSuccess",
      membership: r,
    };
  }
}
