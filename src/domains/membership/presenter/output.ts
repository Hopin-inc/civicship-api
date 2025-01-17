import {
  GqlMembershipsConnection,
  GqlMembership,
  GqlMembershipInviteSuccess,
  GqlMembershipSetInvitationStatusSuccess,
  GqlMembershipWithdrawSuccess,
  GqlMembershipSetRoleSuccess,
  GqlMembershipRemoveSuccess,
} from "@/types/graphql";
import { MembershipPayloadWithArgs } from "@/domains/membership/type";

export default class MembershipOutputFormat {
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

  static get(r: MembershipPayloadWithArgs): GqlMembership {
    const { user, community, ...prop } = r;

    return {
      ...prop,
      user: {
        ...user,
      },
      community: {
        ...community,
      },
    };
  }

  static invite(r: MembershipPayloadWithArgs): GqlMembershipInviteSuccess {
    return {
      __typename: "MembershipInviteSuccess",
      membership: this.get(r),
    };
  }

  static setInvitationStatus(
    r: MembershipPayloadWithArgs,
  ): GqlMembershipSetInvitationStatusSuccess {
    return {
      __typename: "MembershipSetInvitationStatusSuccess",
      membership: this.get(r),
    };
  }

  static withdraw(r: MembershipPayloadWithArgs): GqlMembershipWithdrawSuccess {
    return {
      __typename: "MembershipWithdrawSuccess",
      userId: r.userId,
      communityId: r.communityId,
    };
  }

  static setRole(r: MembershipPayloadWithArgs): GqlMembershipSetRoleSuccess {
    return {
      __typename: "MembershipSetRoleSuccess",
      membership: this.get(r),
    };
  }

  static remove(r: MembershipPayloadWithArgs): GqlMembershipRemoveSuccess {
    return {
      __typename: "MembershipRemoveSuccess",
      userId: r.userId,
      communityId: r.communityId,
    };
  }

  static selfJoin(r: MembershipPayloadWithArgs): GqlMembershipInviteSuccess {
    return {
      __typename: "MembershipInviteSuccess",
      membership: this.get(r),
    };
  }
}
