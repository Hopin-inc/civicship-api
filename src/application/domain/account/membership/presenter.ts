import {
  GqlMembershipsConnection,
  GqlMembership,
  GqlMembershipInviteSuccess,
  GqlMembershipSetInvitationStatusSuccess,
  GqlMembershipWithdrawSuccess,
  GqlMembershipSetRoleSuccess,
  GqlMembershipRemoveSuccess,
  GqlMembershipParticipationLocation,
} from "@/types/graphql";
import {
  PrismaMembership,
  PrismaMembershipDetail,
} from "@/application/domain/account/membership/data/type";
import { ParticipationType } from "@prisma/client";

export default class MembershipPresenter {
  static query(r: GqlMembership[], hasNextPage: boolean): GqlMembershipsConnection {
    return {
      __typename: "MembershipsConnection",
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: r[0]?.user?.id + "_" + r[0]?.community?.id,
        endCursor: r.length
          ? r[r.length - 1].user?.id + "_" + r[r.length - 1].community?.id
          : undefined,
      },
      edges: r.map((edge) => ({
        cursor: edge.user?.id + "_" + edge.community?.id,
        node: edge,
      })),
    };
  }

  static get(r: PrismaMembershipDetail): GqlMembership {
    const { participationGeoViews, participationCountViews, opportunityHostedCountView, ...prop } =
      r;

    const hostedGeoMap = new Map<string, GqlMembershipParticipationLocation>();

    participationGeoViews
      .filter((v) => v.type === ParticipationType.HOSTED)
      .forEach((v) => {
        if (!hostedGeoMap.has(v.placeId)) {
          hostedGeoMap.set(v.placeId, {
            placeId: v.placeId,
            placeName: v.placeName ?? null,
            placeImage: v.placeImage ?? null,
            address: v.address,
            latitude: v.latitude.toString(),
            longitude: v.longitude.toString(),
          });
        }
      });

    const hostedGeo = Array.from(hostedGeoMap.values());

    const hostedCount =
      participationCountViews.find((v) => v.type === ParticipationType.HOSTED)?.totalCount ?? 0;

    return {
      __typename: "Membership",
      ...prop,
      participationView: {
        hosted: {
          totalParticipantCount: hostedCount,
          geo: hostedGeo,
        },
      },
      hostOpportunityCount: opportunityHostedCountView?.totalCount,
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
