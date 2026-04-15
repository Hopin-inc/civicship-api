import { injectable, inject } from "tsyringe";
import {
  GqlQueryVoteTopicsArgs,
  GqlQueryVoteTopicArgs,
  GqlQueryMyVoteEligibilityArgs,
  GqlMutationVoteTopicCreateArgs,
  GqlMutationVoteCastArgs,
  GqlMutationVoteTopicDeleteArgs,
  GqlVoteTopicsConnection,
  GqlVoteTopic,
  GqlMyVoteEligibility,
  GqlVoteTopicCreatePayload,
  GqlVoteCastPayload,
  GqlVoteTopicDeletePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { AuthorizationError } from "@/errors/graphql";
import { clampFirst, getCurrentUserId, getMembershipRolesByCtx } from "@/application/domain/utils";
import VoteService from "./service";
import VotePresenter from "./presenter";
import { IVoteRepository } from "./data/interface";
import { PrismaVoteBallot } from "./data/type";

@injectable()
export default class VoteUseCase {
  constructor(
    @inject("VoteService") private readonly service: VoteService,
    @inject("VoteRepository") private readonly repo: IVoteRepository,
  ) {}

  async anyoneBrowseVoteTopics(
    ctx: IContext,
    { communityId, first, after }: GqlQueryVoteTopicsArgs,
  ): Promise<GqlVoteTopicsConnection> {
    const take = clampFirst(first);
    const currentUserId = ctx.currentUser?.id;
    const { isManager } = getMembershipRolesByCtx(ctx, [communityId], currentUserId);
    const isManagerOfCommunity = !!isManager[communityId];

    const [records, totalCount] = await Promise.all([
      this.repo.queryTopics(ctx, communityId, take, after ?? undefined),
      this.repo.countTopics(ctx, communityId),
    ]);

    const hasNextPage = records.length > take;
    const data = records.slice(0, take);

    // 各 topic の詳細（gate/options含む）を取得してプレゼンター変換
    const topicDetails = await Promise.all(
      data.map((t) => this.repo.findTopicOrThrow(ctx, t.id)),
    );

    const topicGqls = topicDetails.map((topic) =>
      VotePresenter.topic(topic, isManagerOfCommunity),
    );

    return VotePresenter.query(topicGqls, totalCount, hasNextPage, after ?? undefined);
  }

  async anyoneViewVoteTopic(
    ctx: IContext,
    { id }: GqlQueryVoteTopicArgs,
  ): Promise<GqlVoteTopic | null> {
    const topic = await this.repo.findTopic(ctx, id);
    if (!topic) return null;

    const currentUserId = ctx.currentUser?.id;
    const { isManager } = getMembershipRolesByCtx(ctx, [topic.communityId], currentUserId);
    const isManagerOfCommunity = !!isManager[topic.communityId];

    let myBallot: PrismaVoteBallot | null = null;
    if (currentUserId) {
      myBallot = await this.repo.findBallot(ctx, currentUserId, topic.id);
    }

    return VotePresenter.topic(topic, isManagerOfCommunity, myBallot);
  }

  async userGetMyVoteEligibility(
    ctx: IContext,
    { topicId }: GqlQueryMyVoteEligibilityArgs,
  ): Promise<GqlMyVoteEligibility> {
    const userId = getCurrentUserId(ctx);
    const topic = await this.service.getTopicWithRelations(ctx, topicId);
    const eligibility = await this.service.checkEligibility(ctx, userId, topic);

    let currentPower: number | null = null;
    if (eligibility.eligible) {
      currentPower = await this.service.calculatePower(ctx, userId, topic);
    }

    const myBallot = await this.repo.findBallot(ctx, userId, topicId);

    return VotePresenter.eligibility(eligibility, currentPower, myBallot);
  }

  async managerCreateVoteTopic(
    ctx: IContext,
    { input, permission }: GqlMutationVoteTopicCreateArgs,
  ): Promise<GqlVoteTopicCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);

    this.service.validateTopicInput(input);

    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const topic = await this.service.createTopicWithRelations(ctx, input, currentUserId, tx);
      const topicGql = VotePresenter.topic(topic, true);
      return VotePresenter.create(topicGql);
    });
  }

  async userCastVote(
    ctx: IContext,
    { input }: GqlMutationVoteCastArgs,
  ): Promise<GqlVoteCastPayload> {
    const userId = getCurrentUserId(ctx);

    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      // 1. テーマ取得
      const topic = await this.service.getTopicWithRelations(ctx, input.topicId);

      // 2. 期間バリデーション
      this.service.validateVotingPeriod(topic);

      // 3. 資格チェック（初回・再投票とも必ず実行）
      const eligibility = await this.service.checkEligibility(ctx, userId, topic);
      if (!eligibility.eligible) {
        throw new AuthorizationError(eligibility.reason ?? "VOTE_NOT_ELIGIBLE");
      }

      // 4. 選択肢の所属チェック
      this.service.validateOptionBelongsToTopic(input.optionId, topic);

      // 5. Power 計算（再投票時は最新保有数で再計算）
      const power = await this.service.calculatePower(ctx, userId, topic);

      // 6. 既存投票を取得（再投票のデクリメント判定用）
      const existingBallot = await this.service.findBallot(ctx, userId, topic.id, tx);

      // 7. Upsert
      const ballot = await this.service.upsertBallot(ctx, userId, input, power, tx);

      // 8. VoteOption 非正規化カラム更新（同トランザクション内）
      await this.service.updateOptionCounts(ctx, existingBallot, ballot, power, tx);

      const ballotGql = VotePresenter.ballot(ballot);
      return VotePresenter.castBallot(ballotGql);
    });
  }

  async managerDeleteVoteTopic(
    ctx: IContext,
    { id, permission }: GqlMutationVoteTopicDeleteArgs,
  ): Promise<GqlVoteTopicDeletePayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      await this.service.deleteTopic(ctx, id, tx);
      return VotePresenter.deleteTopic(id);
    });
  }
}
