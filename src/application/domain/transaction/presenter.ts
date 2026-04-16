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
          user: {
            id: row.from_user_id,
            name: row.from_user_name,
            image: row.from_user_image,
            bio: row.from_user_bio,
          },
          community: {
            id: row.from_community_id,
            name: row.from_community_name,
            image: row.from_community_image,
            bio: row.from_community_bio,
          },
        }),
        to: buildParticipant({
          user: {
            id: row.to_user_id,
            name: row.to_user_name,
            image: row.to_user_image,
            bio: row.to_user_bio,
          },
          community: {
            id: row.to_community_id,
            name: row.to_community_name,
            image: row.to_community_image,
            bio: row.to_community_bio,
          },
        }),
      })),
    };
  }
}

type ParticipantFields = {
  id: string | null;
  name: string | null;
  image: string | null;
  bio: string | null;
};

type ParticipantCandidate = {
  user: ParticipantFields;
  community: ParticipantFields;
};

// chain SQL の conditional JOIN 結果から、どちらの参加者かを決定する:
// - MEMBER wallet:    t_users JOIN がヒット → user.id が非null
// - COMMUNITY wallet: t_communities JOIN がヒット（JOIN 条件に wallet.type='COMMUNITY' 付き）→ community.id が非null
// - wallet 削除済み / JOIN が全て外れた場合: どちらも null → null を返す
// NOTE: t_wallets.community_id 自体は MEMBER wallet にも存在するが、JOIN 条件で
// wallet.type='COMMUNITY' を指定しているため、community.id 側は COMMUNITY wallet の場合だけ非null になる。
function buildParticipant(
  data: ParticipantCandidate,
): GqlTransactionChainUser | GqlTransactionChainCommunity | null {
  if (data.user.id) {
    return {
      __typename: "TransactionChainUser",
      id: data.user.id,
      name: data.user.name ?? "",
      image: data.user.image ?? null,
      bio: data.user.bio ?? null,
    };
  }
  if (data.community.id) {
    return {
      __typename: "TransactionChainCommunity",
      id: data.community.id,
      name: data.community.name ?? "",
      image: data.community.image ?? null,
      bio: data.community.bio ?? null,
    };
  }
  return null;
}
