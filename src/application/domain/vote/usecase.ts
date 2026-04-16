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
  GqlVoteOption,
  GqlMyVoteEligibility,
  GqlVoteTopicCreatePayload,
  GqlVoteCastPayload,
  GqlVoteTopicDeletePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { AuthorizationError, ValidationError } from "@/errors/graphql";
import { clampFirst, getCurrentUserId, getMembershipRolesByCtx } from "@/application/domain/utils";
import VoteService from "./service";
import VotePresenter, { GqlVoteTopicWithMeta, GqlVoteBallotWithMeta } from "./presenter";
import { PrismaVoteBallot, PrismaVoteOption } from "./data/type";

@injectable()
export default class VoteUseCase {
  constructor(
    @inject("VoteService") private readonly service: VoteService,
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
      this.service.browseTopics(ctx, communityId, take, cursor ?? undefined),
      this.service.countTopics(ctx, communityId),
    ]);

    const hasNextPage = records.length > take;
    const data = records.slice(0, take);

    // browseTopics はリレーション付きで返すので N+1 なし
    // gate/powerPolicy が欠落しているトピックはデータ不整合 → 早期エラーで一覧全体を守る
    data.forEach((topic) => this.service.validateTopicRelations(topic));
    const topicGqls = data.map((topic) => {
      const resultVisible = this.service.calcResultVisible(topic.endsAt, isManagerOfCommunity);
      const phase = this.service.calcPhase(topic.startsAt, topic.endsAt);
      return VotePresenter.topic(topic, resultVisible, phase);
    });

    return VotePresenter.query(topicGqls, totalCount, hasNextPage, cursor ?? undefined);
  }

  async anyoneViewVoteTopic(
    ctx: IContext,
    { id }: GqlQueryVoteTopicArgs,
  ): Promise<GqlVoteTopic | null> {
    const topic = await this.service.findTopic(ctx, id);
    if (!topic) return null;

    this.service.validateTopicRelations(topic);

    const currentUserId = ctx.currentUser?.id;
    const { isManager } = getMembershipRolesByCtx(ctx, [topic.communityId], currentUserId);
    const isManagerOfCommunity = !!isManager[topic.communityId];

    // myBallot は VoteTopic.myBallot フィールドリゾルバー（DataLoader）が取得するため
    // ここで個別に findBallot を呼ばない（二重クエリを防ぐ）
    const resultVisible = this.service.calcResultVisible(topic.endsAt, isManagerOfCommunity);
    const phase = this.service.calcPhase(topic.startsAt, topic.endsAt);
    return VotePresenter.topic(topic, resultVisible, phase);
  }

  async userGetMyVoteEligibility(
    ctx: IContext,
    { topicId }: GqlQueryMyVoteEligibilityArgs,
  ): Promise<GqlMyVoteEligibility> {
    const userId = getCurrentUserId(ctx);
    const topic = await this.service.getTopicWithRelations(ctx, topicId);
    this.service.validateTopicRelations(topic);
    const eligibility = await this.service.checkEligibility(ctx, userId, topic);

    let currentPower: number | null = null;
    if (eligibility.eligible) {
      currentPower = await this.service.calculatePower(ctx, userId, topic);
    }

    const myBallot = await this.service.findBallot(ctx, userId, topicId);

    // endsAt を超えていれば結果を公開（myEligibility context では manager 判定は行わない）
    const resultVisible = this.service.calcResultVisible(topic.endsAt, false);
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
      const resultVisible = this.service.calcResultVisible(topic.endsAt, true);
      const phase = this.service.calcPhase(topic.startsAt, topic.endsAt);
      const topicGql = VotePresenter.topic(topic, resultVisible, phase);
      return VotePresenter.create(topicGql);
    });
  }

  async userCastVote(
    ctx: IContext,
    { input }: GqlMutationVoteCastArgs,
  ): Promise<GqlVoteCastPayload> {
    const userId = getCurrentUserId(ctx);

    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      // 0. 同一ユーザー・同一トピックへの並行投票を TOCTOU から守るアドバイザリーロック
      //    findBallot(null) → upsert(INSERT) の間に別トランザクションが割り込むと
      //    voteCount が二重増分される。ロックでこのウィンドウを完全に閉じる
      await this.service.acquireVoteLock(userId, input.topicId, tx);

      // 1. テーマ取得（トランザクション内）
      const topic = await this.service.getTopicWithRelations(ctx, input.topicId, tx);
      this.service.validateTopicRelations(topic);

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
      const ballotGql = VotePresenter.ballot(ballot, this.service.calcResultVisible(topic.endsAt, false));
      return VotePresenter.castBallot(ballotGql);
    });
  }

  // フィールドリゾルバー専用: VoteTopic.myEligibility の N+1 を回避するため
  // parent（既に DB から取得済みのメタ付き GQL オブジェクト）を直接使用し DB 再取得しない
  async resolveMyEligibilityForParent(
    ctx: IContext,
    parent: GqlVoteTopicWithMeta,
  ): Promise<GqlMyVoteEligibility | null> {
    if (!ctx.currentUser) return null;
    const userId = ctx.currentUser.id;

    // GqlVoteTopicWithMeta は TopicForEligibilityCheck / TopicForPowerCalculation を
    // 構造的に満たすため、型アサーションなしで直接渡せる
    const eligibility = await this.service.checkEligibility(ctx, userId, parent);

    let currentPower: number | null = null;
    if (eligibility.eligible) {
      currentPower = await this.service.calculatePower(ctx, userId, parent);
    }

    const myBallot = await this.service.findBallot(ctx, userId, parent.id);

    // myEligibility コンテキストでは manager 判定は行わず、時刻のみで結果公開を判定
    const resultVisible = this.service.calcResultVisible(parent.endsAt, false);
    return VotePresenter.eligibility(eligibility, currentPower, myBallot, resultVisible);
  }

  // ─── フィールドリゾルバー向けフォーマットデリゲート ──────────────────────────
  // Resolver から Presenter を直接呼ばず UseCase を介することで
  // 「Resolver は UseCase メソッドのみ呼ぶ」原則を維持する

  resolveMyBallotField(ballot: PrismaVoteBallot, resultVisible: boolean): GqlVoteBallotWithMeta {
    return VotePresenter.ballot(ballot, resultVisible);
  }

  resolveOptionField(option: PrismaVoteOption, resultVisible: boolean): GqlVoteOption {
    return VotePresenter.option(option, resultVisible);
  }

  async managerDeleteVoteTopic(
    ctx: IContext,
    { id, permission }: GqlMutationVoteTopicDeleteArgs,
  ): Promise<GqlVoteTopicDeletePayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      // 削除前にコミュニティ所有チェック
      const topic = await this.service.getTopicWithRelations(ctx, id, tx);
      if (topic.communityId !== permission.communityId) {
        throw new AuthorizationError("TOPIC_NOT_IN_COMMUNITY");
      }
      await this.service.deleteTopic(ctx, id, tx);
      return VotePresenter.deleteTopic(id);
    });
  }
}
