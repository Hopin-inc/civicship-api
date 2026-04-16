import {
  GqlVoteTopic,
  GqlVoteOption,
  GqlVoteBallot,
  GqlVoteGate,
  GqlVotePowerPolicy,
  GqlVoteTopicPhase,
  GqlMyVoteEligibility,
  GqlVoteTopicsConnection,
  GqlVoteTopicCreatePayload,
  GqlVoteCastPayload,
  GqlVoteTopicDeletePayload,
} from "@/types/graphql";
import {
  PrismaVoteTopic,
  PrismaVoteGate,
  PrismaVotePowerPolicy,
  PrismaVoteOption,
  PrismaVoteBallot,
} from "./data/type";
import { EligibilityResult } from "./service";

// ─── フィールドリゾルバー向けメタデータ付き GQL 型 ──────────────────────────
// フィールドリゾルバーは parent オブジェクト経由でこれらを参照する
// GQL スキーマ上には存在しないが、Presenter → Resolver 間の型安全な受け渡しに使用

export type GqlVoteGateWithMeta = GqlVoteGate & {
  nftTokenId: string | null; // VoteGate.nftToken リゾルバーが参照
};

export type GqlVotePowerPolicyWithMeta = GqlVotePowerPolicy & {
  nftTokenId: string | null; // VotePowerPolicy.nftToken リゾルバーが参照
};

// フィールドリゾルバーで解決するフィールド（GQL 上 non-null だが Presenter では持たない）を
// Omit して optional に変更することで `null as unknown as ...` キャストを排除する

export type GqlVoteBallotWithMeta = Omit<GqlVoteBallot, "option"> & {
  option?: GqlVoteOption;  // VoteBallot.option フィールドリゾルバーで解決
  optionId: string;        // VoteBallot.option リゾルバーが参照
  resultVisible: boolean;  // VoteOption の集計マスキングに使用
};

// gate/powerPolicy/community は Omit して WithMeta 版で上書き
export type GqlVoteTopicWithMeta = Omit<GqlVoteTopic, "gate" | "powerPolicy" | "community"> & {
  community?: GqlVoteTopic["community"]; // VoteTopic.community フィールドリゾルバーで解決
  communityId: string;                   // VoteTopic.community リゾルバーが参照
  resultVisible: boolean;                // VoteTopic.myBallot リゾルバーが参照
  gate: GqlVoteGateWithMeta;
  powerPolicy: GqlVotePowerPolicyWithMeta;
};

// ─── Presenter ────────────────────────────────────────────────────────────────

export default class VotePresenter {
  static gate(gate: PrismaVoteGate): GqlVoteGateWithMeta {
    return {
      __typename: "VoteGate",
      id: gate.id,
      type: gate.type,
      nftToken: null, // フィールドリゾルバーで解決
      requiredRole: gate.requiredRole ?? null,
      nftTokenId: gate.nftTokenId,
    };
  }

  static powerPolicy(policy: PrismaVotePowerPolicy): GqlVotePowerPolicyWithMeta {
    return {
      __typename: "VotePowerPolicy",
      id: policy.id,
      type: policy.type,
      nftToken: null, // フィールドリゾルバーで解決
      nftTokenId: policy.nftTokenId,
    };
  }

  static option(option: PrismaVoteOption, resultVisible: boolean): GqlVoteOption {
    return {
      __typename: "VoteOption",
      id: option.id,
      label: option.label,
      orderIndex: option.orderIndex,
      voteCount: resultVisible ? option.voteCount : null,
      totalPower: resultVisible ? option.totalPower : null,
    };
  }

  static ballot(ballot: PrismaVoteBallot, resultVisible: boolean = false): GqlVoteBallotWithMeta {
    return {
      __typename: "VoteBallot",
      id: ballot.id,
      // option はフィールドリゾルバーで解決するため省略（Omit 済み）
      power: ballot.power,
      createdAt: ballot.createdAt,
      updatedAt: ballot.updatedAt ?? null,
      optionId: ballot.optionId,
      resultVisible,
    };
  }

  static topic(
    topic: PrismaVoteTopic,
    resultVisible: boolean,
    phase: GqlVoteTopicPhase,
  ): GqlVoteTopicWithMeta {
    return {
      __typename: "VoteTopic",
      id: topic.id,
      // community はフィールドリゾルバーで解決するため省略（Omit 済み）
      communityId: topic.communityId,
      resultVisible,
      title: topic.title,
      description: topic.description ?? null,
      startsAt: topic.startsAt,
      endsAt: topic.endsAt,
      phase,
      // validateTopicRelations() がサービス層で事前に呼ばれるため null は来ない
      gate: this.gate(topic.gate!),
      powerPolicy: this.powerPolicy(topic.powerPolicy!),
      options: topic.options.map((opt) => this.option(opt, resultVisible)),
      myBallot: null, // フィールドリゾルバー（DataLoader）で解決
      myEligibility: null, // フィールドリゾルバーで解決
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt ?? null,
    };
  }

  static eligibility(
    result: EligibilityResult,
    currentPower: number | null,
    myBallot: PrismaVoteBallot | null,
    resultVisible: boolean = false,
  ): GqlMyVoteEligibility {
    return {
      __typename: "MyVoteEligibility",
      eligible: result.eligible,
      reason: result.reason ?? null,
      currentPower: result.eligible ? currentPower : null,
      // WithMeta → GQL 境界: field resolver で option が解決されることを前提とした型境界キャスト
      myBallot: myBallot ? (this.ballot(myBallot, resultVisible) as unknown as GqlVoteBallot) : null,
    };
  }

  static query(
    topics: GqlVoteTopicWithMeta[],
    totalCount: number,
    hasNextPage: boolean,
    cursor?: string,
  ): GqlVoteTopicsConnection {
    // WithMeta → GQL 境界: community/option は field resolver で解決されることを前提とした型境界キャスト
    const gqlTopics = topics as unknown as GqlVoteTopic[];
    return {
      __typename: "VoteTopicsConnection",
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: topics[0]?.id,
        endCursor: topics.length ? topics[topics.length - 1].id : undefined,
      },
      edges: gqlTopics.map((node) => ({
        cursor: node.id,
        node,
      })),
      nodes: gqlTopics,
    };
  }

  static create(topic: GqlVoteTopicWithMeta): GqlVoteTopicCreatePayload {
    return {
      __typename: "VoteTopicCreatePayload",
      // WithMeta → GQL 境界: field resolver で community が解決されることを前提とした型境界キャスト
      voteTopic: topic as unknown as GqlVoteTopic,
    };
  }

  static castBallot(ballot: GqlVoteBallotWithMeta): GqlVoteCastPayload {
    return {
      __typename: "VoteCastPayload",
      // WithMeta → GQL 境界: field resolver で option が解決されることを前提とした型境界キャスト
      ballot: ballot as unknown as GqlVoteBallot,
    };
  }

  static deleteTopic(id: string): GqlVoteTopicDeletePayload {
    return {
      __typename: "VoteTopicDeletePayload",
      id,
    };
  }
}
