import {
  GqlTransaction,
  GqlTransactionsConnection,
  GqlTransactionIssueCommunityPointSuccess,
  GqlTransactionGrantCommunityPointSuccess,
  GqlTransactionDonateSelfPointSuccess,
  GqlTransactionChain,
  GqlTransactionChainCommunity,
  GqlTransactionChainUser,
  GqlTransactionReason,
  GqlTransactionUpdateMetadataSuccess,
} from "@/types/graphql";
import {
  PrismaTransactionDetail,
  TransactionChainRow,
} from "@/application/domain/transaction/data/type";

export default class TransactionPresenter {
  static query(
    r: GqlTransaction[],
    hasNextPage: boolean,
    cursor?: string,
  ): GqlTransactionsConnection {
    return {
      __typename: "TransactionsConnection",
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: r[0]?.id,
        endCursor: r.length ? r[r.length - 1].id : undefined,
      },
      edges: r.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: PrismaTransactionDetail): GqlTransaction {
    return {
      __typename: "Transaction",
      ...r,
    };
  }

  static issueCommunityPoint(r: PrismaTransactionDetail): GqlTransactionIssueCommunityPointSuccess {
    return {
      __typename: "TransactionIssueCommunityPointSuccess",
      transaction: this.get(r),
    };
  }

  static grantCommunityPoint(r: PrismaTransactionDetail): GqlTransactionGrantCommunityPointSuccess {
    return {
      __typename: "TransactionGrantCommunityPointSuccess",
      transaction: this.get(r),
    };
  }

  static giveUserPoint(r: PrismaTransactionDetail): GqlTransactionDonateSelfPointSuccess {
    return {
      __typename: "TransactionDonateSelfPointSuccess",
      transaction: this.get(r),
    };
  }

  static updateMetadata(r: PrismaTransactionDetail): GqlTransactionUpdateMetadataSuccess {
    return {
      __typename: "TransactionUpdateMetadataSuccess",
      transaction: this.get(r),
    };
  }

  static chain(rows: TransactionChainRow[]): GqlTransactionChain {
    return {
      __typename: "TransactionChain",
      depth: rows.length,
      steps: rows.map((row) => ({
        __typename: "TransactionChainStep",
        id: row.id,
        reason: row.reason as GqlTransactionReason,
        points: row.points,
        createdAt: row.created_at,
        from: buildParticipant({
          userId: row.from_user_id,
          userName: row.from_user_name,
          userImage: row.from_user_image,
          userBio: row.from_user_bio,
          communityId: row.from_community_id,
          communityName: row.from_community_name,
          communityImage: row.from_community_image,
          communityBio: row.from_community_bio,
        }),
        to: buildParticipant({
          userId: row.to_user_id,
          userName: row.to_user_name,
          userImage: row.to_user_image,
          userBio: row.to_user_bio,
          communityId: row.to_community_id,
          communityName: row.to_community_name,
          communityImage: row.to_community_image,
          communityBio: row.to_community_bio,
        }),
      })),
    };
  }
}

type ParticipantCandidate = {
  userId: string | null;
  userName: string | null;
  userImage: string | null;
  userBio: string | null;
  communityId: string | null;
  communityName: string | null;
  communityImage: string | null;
  communityBio: string | null;
};

// wallet の user_id / community_id の非nullをもとに、どちらの参加者かを決定する。
// COMMUNITY wallet の場合 community_id のみ非null、MEMBER wallet の場合 user_id のみ非null になる。
// ウォレットが削除済み等でどちらも null の場合は null を返す。
function buildParticipant(
  data: ParticipantCandidate,
): GqlTransactionChainUser | GqlTransactionChainCommunity | null {
  if (data.userId) {
    return {
      __typename: "TransactionChainUser",
      id: data.userId,
      name: data.userName ?? "",
      image: data.userImage ?? null,
      bio: data.userBio ?? null,
    };
  }
  if (data.communityId) {
    return {
      __typename: "TransactionChainCommunity",
      id: data.communityId,
      name: data.communityName ?? "",
      image: data.communityImage ?? null,
      bio: data.communityBio ?? null,
    };
  }
  return null;
}
