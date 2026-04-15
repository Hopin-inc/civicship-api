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
import { AuthorizationError, ValidationError } from "@/errors/graphql";
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
    { communityId, first, cursor }: GqlQueryVoteTopicsArgs,
  ): Promise<GqlVoteTopicsConnection> {
    const take = clampFirst(first);
    const currentUserId = ctx.currentUser?.id;
    const { isManager } = getMembershipRolesByCtx(ctx, [communityId], currentUserId);
    const isManagerOfCommunity = !!isManager[communityId];

    const [records, totalCount] = await Promise.all([
      this.repo.queryTopics(ctx, communityId, take, cursor ?? undefined),
      this.repo.countTopics(ctx, communityId),
    ]);

    const hasNextPage = records.length > take;
    const data = records.slice(0, take);

    // queryTopics はリレーション付きで返すので N+1 なし
    // gate/powerPolicy が欠落しているトピックはデータ不整合 → 早期エラーで一覧全体を守る
    data.forEach((topic) => this.service.validateTopicRelations(topic));
    const topicGqls = data.map((topic) => VotePresenter.topic(topic, isManagerOfCommunity));

    return VotePresenter.query(topicGqls, totalCount, hasNextPage, cursor ?? undefined);
  }

  async anyoneViewVoteTopic(
    ctx: IContext,
    { id }: GqlQueryVoteTopicArgs,
  ): Promise<GqlVoteTopic | null> {
    const topic = await this.repo.findTopic(ctx, id);
    if (!topic) return null;

    this.service.validateTopicRelations(topic);

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

    // endsAt を超えていれば結果を公開（myEligibility context では manager 判定は行わない）
    const resultVisible = new Date() >= topic.endsAt;
    return VotePresenter.eligibility(eligibility, currentPower, myBallot, resultVisible);
  }

  async managerCreateVoteTopic(
    ctx: IContext,
    { input, permission }: GqlMutationVoteTopicCreateArgs,
  ): Promise<GqlVoteTopicCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);

    // permission で指定されたコミュニティと input のコミュニティが一致することを確認
    if (permission.communityId !== input.communityId) {
      throw new ValidationError("communityId in input does not match permission.communityId", []);
    }

    this.service.validateTopicInput(input);

    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const topic = await this.service.createTopicWithRelations(ctx, input, currentUserId, tx);
      this.service.validateTopicRelations(topic);
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
      // 1. テーマ取得（トランザクション内）
      const topic = await this.service.getTopicWithRelations(ctx, input.topicId, tx);

      // 2. 期間バリデーション
      this.service.validateVotingPeriod(topic);

      // 3. 資格チェック（初回・再投票とも必ず実行、tx で TOCTOU を防止）
      const eligibility = await this.service.checkEligibility(ctx, userId, topic, tx);
      if (!eligibility.eligible) {
        throw new AuthorizationError(eligibility.reason ?? "VOTE_NOT_ELIGIBLE");
      }

      // 4. 選択肢の所属チェック
      this.service.validateOptionBelongsToTopic(input.optionId, topic);

      // 5. Power 計算（再投票時は最新保有数で再計算、tx で TOCTOU を防止）
      const power = await this.service.calculatePower(ctx, userId, topic, tx);
      // NFT_COUNT ポリシー + MEMBERSHIP ゲートの組み合わせ等で power=0 になる場合を防ぐ
      if (power <= 0) {
        throw new ValidationError("Insufficient voting power", []);
      }

      // 6. 既存投票を取得（再投票のデクリメント判定用）
      const existingBallot = await this.service.findBallot(ctx, userId, topic.id, tx);

      // 7. Upsert
      const ballot = await this.service.upsertBallot(ctx, userId, input, power, tx);

      // 8. VoteOption 非正規化カラム更新（同トランザクション内）
      await this.service.updateOptionCounts(ctx, existingBallot, ballot, power, tx);

      // 投票期間中のため resultVisible=false（集計値は秘匿）
      const ballotGql = VotePresenter.ballot(ballot, VotePresenter.isResultVisible(topic, false));
      return VotePresenter.castBallot(ballotGql);
    });
  }

  async managerDeleteVoteTopic(
    ctx: IContext,
    { id, permission }: GqlMutationVoteTopicDeleteArgs,
  ): Promise<GqlVoteTopicDeletePayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      // 削除前にコミュニティ所有チェック
      const topic = await this.repo.findTopicOrThrow(ctx, id, tx);
      if (topic.communityId !== permission.communityId) {
        throw new AuthorizationError("TOPIC_NOT_IN_COMMUNITY");
      }
      await this.service.deleteTopic(ctx, id, tx);
      return VotePresenter.deleteTopic(id);
    });
  }
}
