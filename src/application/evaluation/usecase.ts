import {
  GqlEvaluation,
  GqlEvaluationCreatePayload,
  GqlEvaluationsConnection,
  GqlMutationEvaluationFailArgs,
  GqlMutationEvaluationPassArgs,
  GqlQueryEvaluationArgs,
  GqlQueryEvaluationsArgs,
} from "@/types/graphql";
import { EvaluationStatus, TransactionReason } from "@prisma/client";
import { IContext } from "@/types/server";
import EvaluationService from "@/application/evaluation/service";
import EvaluationPresenter from "@/application/evaluation/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { ValidationError } from "@/errors/graphql";
import TransactionService from "@/application/transaction/service";
import WalletValidator from "@/application/membership/wallet/validator";

export default class EvaluationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseEvaluations(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryEvaluationsArgs,
  ): Promise<GqlEvaluationsConnection> {
    return EvaluationService.fetchEvaluations(ctx, { cursor, filter, sort, first });
  }

  static async visitorViewEvaluation(
    ctx: IContext,
    { id }: GqlQueryEvaluationArgs,
  ): Promise<GqlEvaluation | null> {
    const record = await EvaluationService.findEvaluation(ctx, id);
    return record ? EvaluationPresenter.get(record) : null;
  }

  static async managerPassEvaluation(
    { input }: GqlMutationEvaluationPassArgs,
    ctx: IContext,
  ): Promise<GqlEvaluationCreatePayload> {
    const evaluation = await this.issuer.public(ctx, async (tx) => {
      const evaluation = await EvaluationService.createEvaluation(
        ctx,
        input,
        EvaluationStatus.PASSED,
        tx,
      );

      const participation = evaluation.participation;
      if (!participation || !participation.opportunitySlot?.opportunity) {
        throw new ValidationError("Participation or Opportunity not found for evaluation", [
          input.participationId,
        ]);
      }

      const opportunity = participation.opportunitySlot?.opportunity;

      if (opportunity.pointsToEarn && opportunity.pointsToEarn > 0) {
        if (!participation.communityId) {
          throw new ValidationError("Community ID not found for participation", [
            input.participationId,
          ]);
        }

        const { fromWalletId, toWalletId } = await WalletValidator.validateCommunityMemberTransfer(
          ctx,
          tx,
          participation.communityId,
          participation.id,
          opportunity.pointsToEarn,
          TransactionReason.POINT_REWARD,
        );

        await TransactionService.giveRewardPoint(
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

  static async managerFailEvaluation(
    { input }: GqlMutationEvaluationFailArgs,
    ctx: IContext,
  ): Promise<GqlEvaluationCreatePayload> {
    const res = await EvaluationService.createEvaluation(ctx, input, EvaluationStatus.FAILED);
    return EvaluationPresenter.create(res);
  }
}
