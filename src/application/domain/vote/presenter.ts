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
  PrismaVoteTopicBase,
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

export type GqlVoteBallotWithMeta = GqlVoteBallot & {
  optionId: string;      // VoteBallot.option リゾルバーが参照
  resultVisible: boolean; // VoteOption の集計マスキングに使用
};

// gate/powerPolicy は実態として常に WithMeta 版が入るため Omit して上書き
export type GqlVoteTopicWithMeta = Omit<GqlVoteTopic, "gate" | "powerPolicy"> & {
  communityId: string;            // VoteTopic.community リゾルバーが参照
  resultVisible: boolean;         // VoteTopic.myBallot リゾルバーが参照
  gate: GqlVoteGateWithMeta;
  powerPolicy: GqlVotePowerPolicyWithMeta;
};

// ─── Presenter ────────────────────────────────────────────────────────────────

export default class VotePresenter {
  static phase(topic: Pick<PrismaVoteTopicBase, "startsAt" | "endsAt">): GqlVoteTopicPhase {
    const now = new Date();
    if (now < topic.startsAt) return "UPCOMING";
    // >= で validateVotingPeriod / isResultVisible の境界と統一
    if (now >= topic.endsAt) return "CLOSED";
    return "OPEN";
  }

  static isResultVisible(topic: Pick<PrismaVoteTopicBase, "endsAt">, isManager: boolean): boolean {
    return isManager || new Date() >= topic.endsAt;
  }

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
      option: null as unknown as GqlVoteOption, // フィールドリゾルバーで解決
      power: ballot.power,
      createdAt: ballot.createdAt,
      updatedAt: ballot.updatedAt ?? null,
      optionId: ballot.optionId,
      resultVisible,
    };
  }

  static topic(
    topic: PrismaVoteTopic,
    isManager: boolean,
  ): GqlVoteTopicWithMeta {
    const resultVisible = this.isResultVisible(topic, isManager);
    return {
      __typename: "VoteTopic",
      id: topic.id,
      community: null as unknown as GqlVoteTopic["community"], // フィールドリゾルバーで解決
      communityId: topic.communityId,
      resultVisible,
      title: topic.title,
      description: topic.description ?? null,
      startsAt: topic.startsAt,
      endsAt: topic.endsAt,
      phase: this.phase(topic),
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
      myBallot: myBallot ? this.ballot(myBallot, resultVisible) : null,
    };
  }

  static query(
    topics: GqlVoteTopicWithMeta[],
    totalCount: number,
    hasNextPage: boolean,
    cursor?: string,
  ): GqlVoteTopicsConnection {
    return {
      __typename: "VoteTopicsConnection",
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: topics[0]?.id,
        endCursor: topics.length ? topics[topics.length - 1].id : undefined,
      },
      edges: topics.map((node) => ({
        cursor: node.id,
        node,
      })),
      nodes: topics,
    };
  }

  static create(topic: GqlVoteTopicWithMeta): GqlVoteTopicCreatePayload {
    return {
      __typename: "VoteTopicCreatePayload",
      voteTopic: topic,
    };
  }

  static castBallot(ballot: GqlVoteBallotWithMeta): GqlVoteCastPayload {
    return {
      __typename: "VoteCastPayload",
      ballot,
    };
  }

  static deleteTopic(id: string): GqlVoteTopicDeletePayload {
    return {
      __typename: "VoteTopicDeletePayload",
      id,
    };
  }
}
