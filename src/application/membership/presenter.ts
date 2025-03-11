import {
  GqlMembershipsConnection,
  GqlMembership,
  GqlMembershipInviteSuccess,
  GqlMembershipSetInvitationStatusSuccess,
  GqlMembershipWithdrawSuccess,
  GqlMembershipSetRoleSuccess,
  GqlMembershipRemoveSuccess,
} from "@/types/graphql";
import { PrismaMembership } from "@/application/membership/data/type";
import CommunityPresenter from "@/application/community/presenter";

export default class MembershipPresenter {
  static query(r: GqlMembership[], hasNextPage: boolean): GqlMembershipsConnection {
    return {
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: r[0]?.user.id + "_" + r[0]?.community.id,
        endCursor: r.length
          ? r[r.length - 1].user.id + "_" + r[r.length - 1].community.id
          : undefined,
      },
      edges: r.map((edge) => ({
        cursor: edge.user.id + "_" + edge.community.id,
        node: edge,
      })),
    };
  }

  static get(r: PrismaMembership): GqlMembership {
    const { community, ...prop } = r;

    return {
      ...prop,
      community: CommunityPresenter.get(community),
    };
  }

  static invite(r: PrismaMembership): GqlMembershipInviteSuccess {
    return {
      __typename: "MembershipInviteSuccess",
      membership: this.get(r),
    };
  }

  static setInvitationStatus(r: PrismaMembership): GqlMembershipSetInvitationStatusSuccess {
    return {
      __typename: "MembershipSetInvitationStatusSuccess",
      membership: this.get(r),
    };
  }

  static withdraw(membership: {
    userId: string;
    communityId: string;
  }): GqlMembershipWithdrawSuccess {
    const { userId, communityId } = membership;
    return {
      __typename: "MembershipWithdrawSuccess",
      userId,
      communityId,
    };
  }

  static remove(membership: { userId: string; communityId: string }): GqlMembershipRemoveSuccess {
    const { userId, communityId } = membership;
    return {
      __typename: "MembershipRemoveSuccess",
      userId,
      communityId,
    };
  }

  static setRole(r: PrismaMembership): GqlMembershipSetRoleSuccess {
    return {
      __typename: "MembershipSetRoleSuccess",
      membership: this.get(r),
    };
  }
}
