import { injectable, inject } from "tsyringe";
import {
  GqlQueryVoteTopicsArgs,
  GqlQueryVoteTopicArgs,
  GqlQueryMyVoteEligibilityArgs,
  GqlMutationVoteTopicCreateArgs,
  GqlMutationVoteTopicUpdateArgs,
  GqlMutationVoteCastArgs,
  GqlMutationVoteTopicDeleteArgs,
  GqlVoteOption,
  GqlVoteTopicDeleteSuccess,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { AuthorizationError, ValidationError } from "@/errors/graphql";
import {
  clampFirst,
  getCommunityIdFromCtx,
  getCurrentUserId,
  getMembershipRolesByCtx,
} from "@/application/domain/utils";
import VoteService from "./service";
import VotePresenter, {
  GqlVoteTopicWithMeta,
  GqlVoteBallotWithMeta,
  GqlVoteTopicsConnectionWithMeta,
  GqlMyVoteEligibilityWithMeta,
  GqlVoteTopicCreatePayloadWithMeta,
  GqlVoteTopicUpdatePayloadWithMeta,
  GqlVoteCastPayloadWithMeta,
} from "./presenter";
import { PrismaVoteBallot, PrismaVoteOption } from "./data/type";

@injectable()
export default class VoteUseCase {
  constructor(@inject("VoteService") private readonly service: VoteService) {}

  async anyoneBrowseVoteTopics(
    ctx: IContext,
    { communityId, first, cursor }: GqlQueryVoteTopicsArgs,
  ): Promise<GqlVoteTopicsConnectionWithMeta> {
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
  ): Promise<GqlVoteTopicWithMeta | null> {
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
  ): Promise<GqlMyVoteEligibilityWithMeta> {
    const userId = getCurrentUserId(ctx);
    const topic = await this.service.getTopicWithRelations(ctx, topicId);
    this.service.validateTopicRelations(topic);
    const eligibility = await this.service.checkEligibility(ctx, userId, topic);

    let currentPower: number | null = null;
    if (eligibility.eligible) {
      currentPower = await this.service.calculatePower(ctx, userId, topic);
    }

    const myBallot = await this.service.findBallot(ctx, userId, topicId);

    // 管理者は投票期間中も集計値を参照できる（PR設計方針と一致）
    const { isManager } = getMembershipRolesByCtx(ctx, [topic.communityId], userId);
    const resultVisible = this.service.calcResultVisible(
      topic.endsAt,
      !!isManager[topic.communityId],
    );
    return VotePresenter.eligibility(eligibility, currentPower, myBallot, resultVisible);
  }

  async managerCreateVoteTopic(
    ctx: IContext,
    { input }: GqlMutationVoteTopicCreateArgs,
  ): Promise<GqlVoteTopicCreatePayloadWithMeta> {
    const currentUserId = getCurrentUserId(ctx);
    const ctxCommunityId = getCommunityIdFromCtx(ctx);

    // ctx と input のコミュニティが一致することを確認（クライアントの取り違え防止）
    if (ctxCommunityId !== input.communityId) {
      throw new ValidationError("communityId in input does not match x-community-id header", []);
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

  async managerUpdateVoteTopic(
    ctx: IContext,
    { id, input }: GqlMutationVoteTopicUpdateArgs,
  ): Promise<GqlVoteTopicUpdatePayloadWithMeta> {
    const ctxCommunityId = getCommunityIdFromCtx(ctx);
    this.service.validateTopicInput(input);

    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      // 既存 topic を取得し、コミュニティ所属・UPCOMING フェーズを検証
      const existing = await this.service.getTopicWithRelations(ctx, id, tx);
      if (existing.communityId !== ctxCommunityId) {
        throw new AuthorizationError("TOPIC_NOT_IN_COMMUNITY");
      }
      this.service.validateTopicIsUpcoming(existing);

      const topic = await this.service.updateTopicWithRelations(ctx, id, input, tx);
      this.service.validateTopicRelations(topic);
      const resultVisible = this.service.calcResultVisible(topic.endsAt, true);
      const phase = this.service.calcPhase(topic.startsAt, topic.endsAt);
      const topicGql = VotePresenter.topic(topic, resultVisible, phase);
      return VotePresenter.update(topicGql);
    });
  }

  async userCastVote(
    ctx: IContext,
    { input }: GqlMutationVoteCastArgs,
  ): Promise<GqlVoteCastPayloadWithMeta> {
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

      // 管理者は投票期間中も集計値を参照できる（PR設計方針と一致）
      const { isManager } = getMembershipRolesByCtx(ctx, [topic.communityId], userId);
      const ballotGql = VotePresenter.ballot(
        ballot,
        this.service.calcResultVisible(topic.endsAt, !!isManager[topic.communityId]),
      );
      return VotePresenter.castBallot(ballotGql);
    });
  }

  // フィールドリゾルバー専用: VoteTopic.myEligibility の N+1 を回避するため
  // parent（既に DB から取得済みのメタ付き GQL オブジェクト）を直接使用し DB 再取得しない
  async resolveMyEligibilityForParent(
    ctx: IContext,
    parent: GqlVoteTopicWithMeta,
  ): Promise<GqlMyVoteEligibilityWithMeta | null> {
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

    // parent.resultVisible は VotePresenter.topic() が isManager を考慮して算出済みの値
    // ここで再計算せずそのまま使うことで、管理者判定も正しく引き継がれる
    return VotePresenter.eligibility(eligibility, currentPower, myBallot, parent.resultVisible);
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
    { id }: GqlMutationVoteTopicDeleteArgs,
  ): Promise<GqlVoteTopicDeleteSuccess> {
    const ctxCommunityId = getCommunityIdFromCtx(ctx);
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      // 削除前にコミュニティ所有チェック
      const topic = await this.service.getTopicWithRelations(ctx, id, tx);
      if (topic.communityId !== ctxCommunityId) {
        throw new AuthorizationError("TOPIC_NOT_IN_COMMUNITY");
      }
      // UPCOMING フェーズのみ削除を許可（OPEN / CLOSED は投票結果保護のためイミュータブル）
      this.service.validateTopicIsUpcoming(topic);
      await this.service.deleteTopic(ctx, id, tx);
      return VotePresenter.deleteTopic(id);
    });
  }
}
