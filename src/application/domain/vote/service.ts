import { injectable, inject } from "tsyringe";
import { Prisma, MembershipStatus, Role } from "@prisma/client";
import { IContext } from "@/types/server";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { isRoleAtLeast } from "@/application/domain/utils";
import { IVoteRepository } from "./data/interface";
import VoteConverter from "./data/converter";
import {
  PrismaVoteTopic,
  PrismaVoteBallot,
} from "./data/type";
import {
  GqlVoteTopicCreateInput,
  GqlVoteCastInput,
} from "@/types/graphql";
import MembershipService from "@/application/domain/account/membership/service";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

@injectable()
export default class VoteService {
  constructor(
    @inject("VoteRepository") private readonly repo: IVoteRepository,
    @inject("VoteConverter") private readonly converter: VoteConverter,
    @inject("MembershipService") private readonly membershipService: MembershipService,
    @inject("NftInstanceRepository") private readonly nftInstanceRepo: INftInstanceRepository,
  ) {}

  async getTopicWithRelations(ctx: IContext, id: string, tx?: Prisma.TransactionClient): Promise<PrismaVoteTopic> {
    return this.repo.findTopicOrThrow(ctx, id, tx);
  }

  validateTopicInput(input: GqlVoteTopicCreateInput): void {
    if (new Date(input.startsAt) >= new Date(input.endsAt)) {
      throw new ValidationError("startsAt must be before endsAt", []);
    }
    if (!input.options || input.options.length < 2) {
      throw new ValidationError("At least 2 options are required", []);
    }
    const orderIndices = input.options.map((o) => o.orderIndex);
    if (orderIndices.some((i) => i < 0)) {
      throw new ValidationError("Option orderIndex must be non-negative", []);
    }
    if (new Set(orderIndices).size !== orderIndices.length) {
      throw new ValidationError("Option orderIndex values must be unique", []);
    }
    if (input.gate.type === "NFT" && !input.gate.nftTokenId) {
      throw new ValidationError("nftTokenId is required for NFT gate", []);
    }
    if (input.powerPolicy.type === "NFT_COUNT" && !input.powerPolicy.nftTokenId) {
      throw new ValidationError("nftTokenId is required for NFT_COUNT power policy", []);
    }
  }

  validateVotingPeriod(topic: PrismaVoteTopic): void {
    const now = new Date();
    if (now < topic.startsAt) {
      throw new ValidationError("Voting has not started yet", []);
    }
    // >= で isResultVisible の境界と一致させる（endsAt の瞬間に結果が見えてから投票できる抜け穴を防ぐ）
    if (now >= topic.endsAt) {
      throw new ValidationError("Voting period has ended", []);
    }
  }

  validateTopicRelations(topic: PrismaVoteTopic): void {
    // gate と powerPolicy はスキーマ上 non-null のため、欠落はデータ不整合を示す
    if (!topic.gate) {
      throw new ValidationError(`VoteTopic(${topic.id}) has no gate configured`, []);
    }
    if (!topic.powerPolicy) {
      throw new ValidationError(`VoteTopic(${topic.id}) has no powerPolicy configured`, []);
    }
  }

  validateOptionBelongsToTopic(optionId: string, topic: PrismaVoteTopic): void {
    const option = topic.options.find((o) => o.id === optionId);
    if (!option) {
      throw new NotFoundError("VoteOption", { id: optionId, topicId: topic.id });
    }
  }

  async checkEligibility(
    ctx: IContext,
    userId: string,
    topic: PrismaVoteTopic,
    tx?: Prisma.TransactionClient,
  ): Promise<EligibilityResult> {
    const gate = topic.gate;
    if (!gate) {
      return { eligible: false, reason: "GATE_NOT_CONFIGURED" };
    }

    if (gate.type === "NFT") {
      if (!gate.nftTokenId) {
        return { eligible: false, reason: "GATE_NFT_TOKEN_NOT_CONFIGURED" };
      }
      // EXISTS クエリで判定（COUNT より効率的・意味が明確）
      // tx を渡すことで投票トランザクション内での読み取りを保証（TOCTOU 防止）
      const exists = await this.nftInstanceRepo.existsByUserAndToken(ctx, userId, gate.nftTokenId, tx);
      return exists
        ? { eligible: true }
        : { eligible: false, reason: "REQUIRED_NFT_NOT_FOUND" };
    }

    if (gate.type === "MEMBERSHIP") {
      const membership = await this.membershipService.findMembership(ctx, userId, topic.communityId, tx);
      if (!membership || membership.status !== MembershipStatus.JOINED) {
        return { eligible: false, reason: "NOT_A_MEMBER" };
      }
      const minRole = (gate.requiredRole as Role | null) ?? Role.MEMBER;
      return isRoleAtLeast(membership.role, minRole)
        ? { eligible: true }
        : { eligible: false, reason: "INSUFFICIENT_ROLE" };
    }

    return { eligible: false, reason: "UNKNOWN_GATE_TYPE" };
  }

  async calculatePower(
    ctx: IContext,
    userId: string,
    topic: PrismaVoteTopic,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const policy = topic.powerPolicy;
    if (!policy || policy.type === "FLAT") {
      return 1;
    }
    // NFT_COUNT: 保有 NftInstance 数を票数とする
    if (!policy.nftTokenId) {
      // validateTopicInput で nftTokenId を必須としているため、ここに到達するのはデータ不整合
      throw new ValidationError("nftTokenId is required for NFT_COUNT power policy", []);
    }
    // tx を渡すことで投票トランザクション内での読み取りを保証（TOCTOU 防止）
    const count = await this.nftInstanceRepo.countByUserAndToken(ctx, userId, policy.nftTokenId, tx);
    return count;
  }

  async findBallot(
    ctx: IContext,
    userId: string,
    topicId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaVoteBallot | null> {
    return this.repo.findBallot(ctx, userId, topicId, tx);
  }

  async upsertBallot(
    ctx: IContext,
    userId: string,
    input: GqlVoteCastInput,
    power: number,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVoteBallot> {
    return this.repo.upsertBallot(ctx, userId, input, power, tx);
  }

  async updateOptionCounts(
    ctx: IContext,
    existingBallot: PrismaVoteBallot | null,
    newBallot: PrismaVoteBallot,
    newPower: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    if (existingBallot && existingBallot.optionId === newBallot.optionId) {
      // 同じ選択肢への再投票: voteCount は変化なし、totalPower のみ差分更新
      const delta = newPower - existingBallot.power;
      await this.repo.adjustOptionTotalPower(ctx, newBallot.optionId, delta, tx);
      return;
    }

    if (existingBallot) {
      // 別選択肢への再投票: 旧選択肢を全デクリメント
      await this.repo.decrementOptionCount(ctx, existingBallot.optionId, existingBallot.power, tx);
    }
    // 新選択肢をインクリメント
    await this.repo.incrementOptionCount(ctx, newBallot.optionId, newPower, tx);
  }

  async createTopicWithRelations(
    ctx: IContext,
    input: GqlVoteTopicCreateInput,
    currentUserId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVoteTopic> {
    // 1. Topic を作成
    const topicData = this.converter.createTopic(input, currentUserId);
    const topic = await this.repo.createTopic(ctx, topicData, tx);

    // 2. Gate を作成（VoteTopic の後に作成: FK は gate.topicId → topic.id）
    await this.repo.createGate(ctx, topic.id, input.gate, tx);

    // 3. PowerPolicy を作成
    await this.repo.createPowerPolicy(ctx, topic.id, input.powerPolicy, tx);

    // 4. Options を作成
    await this.repo.createOptions(ctx, topic.id, input.options, tx);

    // 5. リレーション付きで再取得（同じトランザクション内で取得）
    return this.repo.findTopicOrThrow(ctx, topic.id, tx);
  }

  async deleteTopic(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await this.repo.deleteTopic(ctx, id, tx);
  }
}
