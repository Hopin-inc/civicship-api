import { inject, injectable } from "tsyringe";
import {
  GqlEvaluation,
  GqlEvaluationCreatePayload,
  GqlEvaluationsConnection,
  GqlMutationEvaluationFailArgs,
  GqlMutationEvaluationPassArgs,
  GqlQueryEvaluationArgs,
  GqlQueryEvaluationsArgs,
} from "@/types/graphql";
import { EvaluationStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import EvaluationService from "@/application/domain/experience/evaluation/service";
import EvaluationPresenter from "@/application/domain/experience/evaluation/presenter";
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
      const evaluation = await this.evaluationService.createEvaluation(
        ctx,
        currentUserId,
        input,
        EvaluationStatus.PASSED,
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
    console.log(evaluation, "passed");

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
        EvaluationStatus.FAILED,
        tx,
      );
    });
    console.log(evaluation, "failed");
    return EvaluationPresenter.create(evaluation);
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
