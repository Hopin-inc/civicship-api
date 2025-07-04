import { inject, injectable } from "tsyringe";
import {
  GqlEvaluation,
  GqlEvaluationBulkCreatePayload,
  GqlEvaluationCreatePayload,
  GqlEvaluationsConnection,
  GqlMutationEvaluationBulkCreateArgs,
  GqlMutationEvaluationFailArgs,
  GqlMutationEvaluationPassArgs,
  GqlParticipationStatus,
  GqlParticipationStatusReason,
  GqlQueryEvaluationArgs,
  GqlQueryEvaluationsArgs,
} from "@/types/graphql";
import { GqlEvaluationStatus } from "@/types/graphql";
import { IContext } from "@/types/server";
import EvaluationService from "@/application/domain/experience/evaluation/service";
import EvaluationPresenter from "@/application/domain/experience/evaluation/presenter";
import { PrismaEvaluationDetail } from "@/application/domain/experience/evaluation/data/type";
import WalletService from "@/application/domain/account/wallet/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { ITransactionService } from "@/application/domain/transaction/data/interface";
import ParticipationService from "@/application/domain/experience/participation/service";
import { CannotEvaluateBeforeOpportunityStartError, ValidationError } from "@/errors/graphql";

@injectable()
export default class EvaluationUseCase {
  constructor(
    @inject("EvaluationService") private readonly evaluationService: EvaluationService,
    @inject("ParticipationService") private readonly participationService: ParticipationService,
    @inject("TransactionService") private readonly transactionService: ITransactionService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("WalletValidator") private readonly walletValidator: WalletValidator,
  ) {}

  async visitorBrowseEvaluations(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryEvaluationsArgs,
  ): Promise<GqlEvaluationsConnection> {
    const take = clampFirst(first);
    const evaluations = await this.evaluationService.fetchEvaluations(
      ctx,
      { cursor, filter, sort },
      take,
    );

    const hasNextPage = evaluations.length > take;
    const data = evaluations.slice(0, take).map(EvaluationPresenter.get);
    return EvaluationPresenter.query(data, hasNextPage);
  }

  async visitorViewEvaluation(
    ctx: IContext,
    { id }: GqlQueryEvaluationArgs,
  ): Promise<GqlEvaluation | null> {
    const evaluation = await this.evaluationService.findEvaluation(ctx, id);
    return evaluation ? EvaluationPresenter.get(evaluation) : null;
  }

  async managerPassEvaluation(
    { input }: GqlMutationEvaluationPassArgs,
    ctx: IContext,
  ): Promise<GqlEvaluationCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);
    await this.validateEvaluatable(ctx, input.participationId);

    const evaluation = await ctx.issuer.public(ctx, async (tx) => {
      //TODO 理由に評価されたからを追加する
      await this.participationService.setStatus(
        ctx,
        input.participationId,
        GqlParticipationStatus.Participated,
        GqlParticipationStatusReason.ReservationAccepted,
        tx,
        currentUserId,
      );
      const evaluation = await this.evaluationService.createEvaluation(
        ctx,
        currentUserId,
        input,
        GqlEvaluationStatus.Passed,
        tx,
      );

      const { participation, opportunity, communityId, userId } =
        this.evaluationService.validateParticipationHasOpportunity(evaluation);

      if (opportunity.pointsToEarn && opportunity.pointsToEarn > 0) {
        const [fromWallet, toWallet] = await Promise.all([
          this.walletService.findMemberWalletOrThrow(ctx, currentUserId, communityId),
          this.walletService.createMemberWalletIfNeeded(ctx, userId, communityId, tx),
        ]);

        const { fromWalletId, toWalletId } =
          await this.walletValidator.validateTransferMemberToMember(
            fromWallet,
            toWallet,
            opportunity.pointsToEarn,
          );

        await this.transactionService.giveRewardPoint(
          ctx,
          tx,
          participation.id,
          opportunity.pointsToEarn,
          fromWalletId,
          toWalletId,
        );
      }

      return evaluation;
    });

    return EvaluationPresenter.create(evaluation);
  }

  async managerFailEvaluation(
    { input }: GqlMutationEvaluationFailArgs,
    ctx: IContext,
  ): Promise<GqlEvaluationCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);
    await this.validateEvaluatable(ctx, input.participationId);

    const evaluation = await ctx.issuer.public(ctx, async (tx) => {
      return await this.evaluationService.createEvaluation(
        ctx,
        currentUserId,
        input,
        GqlEvaluationStatus.Failed,
        tx,
      );
    });

    return EvaluationPresenter.create(evaluation);
  }

  async managerBulkCreateEvaluations(
    { input }: GqlMutationEvaluationBulkCreateArgs,
    ctx: IContext,
  ): Promise<GqlEvaluationBulkCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);
    const evaluations: PrismaEvaluationDetail[] = [];

    const createdEvaluations = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      for (const item of input.evaluations) {
        await this.validateEvaluatable(ctx, item.participationId);

        //TODO 理由に評価されたからを追加する
        await this.participationService.setStatus(
          ctx,
          item.participationId,
          GqlParticipationStatus.Participated,
          GqlParticipationStatusReason.ReservationAccepted,
          tx,
          currentUserId,
        );

        const evaluation = await this.evaluationService.createEvaluation(
          ctx,
          currentUserId,
          { participationId: item.participationId, comment: item.comment },
          item.status,
          tx,
        );

        if (item.status === GqlEvaluationStatus.Passed) {
          const { participation, opportunity, communityId, userId } =
            this.evaluationService.validateParticipationHasOpportunity(evaluation);

          if (opportunity.pointsToEarn && opportunity.pointsToEarn > 0) {
            const [fromWallet, toWallet] = await Promise.all([
              this.walletService.findMemberWalletOrThrow(ctx, currentUserId, communityId),
              this.walletService.createMemberWalletIfNeeded(ctx, userId, communityId, tx),
            ]);

            const { fromWalletId, toWalletId } =
              await this.walletValidator.validateTransferMemberToMember(
                fromWallet,
                toWallet,
                opportunity.pointsToEarn,
              );

            await this.transactionService.giveRewardPoint(
              ctx,
              tx,
              participation.id,
              opportunity.pointsToEarn,
              fromWalletId,
              toWalletId,
            );
          }
        }

        evaluations.push(evaluation);
      }

      return evaluations;
    });

    return EvaluationPresenter.bulkCreate(createdEvaluations);
  }

  private async validateEvaluatable(ctx: IContext, participationId: string) {
    const participation = await this.participationService.findParticipationWithSlotOrThrow(
      ctx,
      participationId,
    );
    await this.evaluationService.throwIfExist(ctx, participationId);

    const startsAt = participation.reservation?.opportunitySlot.startsAt;
    if (!startsAt) {
      throw new ValidationError("OpportunitySlot startsAt is undefined.");
    }

    const jstStartsAt = new Date(startsAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const nowJST = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

    if (new Date(nowJST) < new Date(jstStartsAt)) {
      throw new CannotEvaluateBeforeOpportunityStartError();
    }
  }
}
