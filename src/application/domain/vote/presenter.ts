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

  static gate(gate: PrismaVoteGate): GqlVoteGate {
    return {
      __typename: "VoteGate",
      id: gate.id,
      type: gate.type,
      nftToken: null, // フィールドリゾルバーで解決
      requiredRole: gate.requiredRole ?? null,
      // フィールドリゾルバー (VoteGate.nftToken) が parent.nftTokenId を参照するため保持
      nftTokenId: gate.nftTokenId,
    } as GqlVoteGate;
  }

  static powerPolicy(policy: PrismaVotePowerPolicy): GqlVotePowerPolicy {
    return {
      __typename: "VotePowerPolicy",
      id: policy.id,
      type: policy.type,
      nftToken: null, // フィールドリゾルバーで解決
      // フィールドリゾルバー (VotePowerPolicy.nftToken) が parent.nftTokenId を参照するため保持
      nftTokenId: policy.nftTokenId,
    } as GqlVotePowerPolicy;
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

  static ballot(ballot: PrismaVoteBallot, resultVisible: boolean = false): GqlVoteBallot {
    return {
      __typename: "VoteBallot",
      id: ballot.id,
      option: null as unknown as GqlVoteOption, // フィールドリゾルバーで解決
      power: ballot.power,
      createdAt: ballot.createdAt,
      updatedAt: ballot.updatedAt ?? null,
      // フィールドリゾルバー (VoteBallot.option) が参照するメタデータ
      optionId: ballot.optionId,
      // VoteBallot.option リゾルバーが voteCount/totalPower を秘匿するために使用
      resultVisible,
    } as GqlVoteBallot;
  }

  static topic(
    topic: PrismaVoteTopic,
    isManager: boolean,
    myBallot: PrismaVoteBallot | null = null,
  ): GqlVoteTopic {
    const resultVisible = this.isResultVisible(topic, isManager);
    return {
      __typename: "VoteTopic",
      id: topic.id,
      community: null as unknown as GqlVoteTopic["community"], // フィールドリゾルバーで解決
      // フィールドリゾルバー (VoteTopic.community) が parent.communityId を参照するため保持
      communityId: topic.communityId,
      title: topic.title,
      description: topic.description ?? null,
      startsAt: topic.startsAt,
      endsAt: topic.endsAt,
      phase: this.phase(topic),
      // validateTopicRelations() がサービス層で事前に呼ばれるため null は来ない
      gate: this.gate(topic.gate!),
      powerPolicy: this.powerPolicy(topic.powerPolicy!),
      options: topic.options.map((opt) => this.option(opt, resultVisible)),
      myBallot: myBallot ? this.ballot(myBallot, resultVisible) : null,
      myEligibility: null, // フィールドリゾルバーで解決
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt ?? null,
    } as GqlVoteTopic;
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
    topics: GqlVoteTopic[],
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

  static create(topic: GqlVoteTopic): GqlVoteTopicCreatePayload {
    return {
      __typename: "VoteTopicCreatePayload",
      voteTopic: topic,
    };
  }

  static castBallot(ballot: GqlVoteBallot): GqlVoteCastPayload {
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
