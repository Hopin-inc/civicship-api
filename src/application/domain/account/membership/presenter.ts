import {
  GqlMembershipsConnection,
  GqlMembership,
  GqlMembershipInviteSuccess,
  GqlMembershipSetInvitationStatusSuccess,
  GqlMembershipWithdrawSuccess,
  GqlMembershipSetRoleSuccess,
  GqlMembershipRemoveSuccess,
  GqlMembershipParticipationView,
  GqlMembershipParticipatedMetrics,
  GqlMembershipHostedMetrics,
} from "@/types/graphql";
import { PrismaMembership } from "@/application/domain/account/membership/data/type";
import CommunityPresenter from "@/application/domain/account/community/presenter";
import UserPresenter from "@/application/domain/account/user/presenter";

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
    const { community, participationGeoViews, participationCountViews, user, ...prop } = r;

    return {
      ...prop,
      user: UserPresenter.get(user),
      community: CommunityPresenter.get(community),
      participationView: MembershipPresenter.formatParticipationView(
        participationGeoViews,
        participationCountViews,
      ),
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

  private static formatParticipationView(
    geoList?: PrismaMembership["participationGeoViews"],
    countList?: PrismaMembership["participationCountViews"],
  ): GqlMembershipParticipationView {
    return {
      hosted: this.extractHostedMetrics(geoList, countList),
      participated: this.extractParticipatedMetrics(geoList, countList),
    };
  }

  private static extractHostedMetrics(
    geoList?: PrismaMembership["participationGeoViews"],
    countList?: PrismaMembership["participationCountViews"],
  ): GqlMembershipHostedMetrics {
    const geo =
      geoList
        ?.filter((g) => g.type === "HOSTED")
        .map((g) => ({
          placeId: g.placeId,
          placeName: g.placeName,
          placeImage: g.placeImage,
          address: g.address,
          latitude: g.latitude.toString(),
          longitude: g.longitude.toString(),
        })) ?? [];

    const totalParticipantCount = countList?.find((c) => c.type === "HOSTED")?.totalCount ?? 0;

    return { geo, totalParticipantCount };
  }

  private static extractParticipatedMetrics(
    geoList?: PrismaMembership["participationGeoViews"],
    countList?: PrismaMembership["participationCountViews"],
  ): GqlMembershipParticipatedMetrics {
    const geo =
      geoList
        ?.filter((g) => g.type === "PARTICIPATED")
        .map((g) => ({
          placeId: g.placeId,
          placeName: g.placeName,
          placeImage: g.placeImage,
          address: g.address,
          latitude: g.latitude.toString(),
          longitude: g.longitude.toString(),
        })) ?? [];

    const totalParticipatedCount =
      countList?.find((c) => c.type === "PARTICIPATED")?.totalCount ?? 0;

    return { geo, totalParticipatedCount };
  }
}
