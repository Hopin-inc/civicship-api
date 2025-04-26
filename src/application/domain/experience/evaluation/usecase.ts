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
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import TransactionService from "@/application/domain/transaction/service";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import WalletService from "@/application/domain/account/wallet/service";
import WalletValidator from "@/application/domain/account/wallet/validator";

export default class EvaluationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseEvaluations(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryEvaluationsArgs,
  ): Promise<GqlEvaluationsConnection> {
    const take = clampFirst(first);
    const evaluations = await EvaluationService.fetchEvaluations(
      ctx,
      { cursor, filter, sort },
      take,
    );

    const hasNextPage = evaluations.length > take;
    const data = evaluations.slice(0, take).map(EvaluationPresenter.get);
    return EvaluationPresenter.query(data, hasNextPage);
  }

  static async visitorViewEvaluation(
    ctx: IContext,
    { id }: GqlQueryEvaluationArgs,
  ): Promise<GqlEvaluation | null> {
    const evaluation = await EvaluationService.findEvaluation(ctx, id);
    return evaluation ? EvaluationPresenter.get(evaluation) : null;
  }

  static async managerPassEvaluation(
    { input }: GqlMutationEvaluationPassArgs,
    ctx: IContext,
  ): Promise<GqlEvaluationCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);

    const evaluation = await this.issuer.public(ctx, async (tx) => {
      const evaluation = await EvaluationService.createEvaluation(
        ctx,
        input,
        EvaluationStatus.PASSED,
        tx,
      );

      const { participation, opportunity, communityId, userId } =
        EvaluationService.validateParticipationHasOpportunity(evaluation);

      if (opportunity.pointsToEarn && opportunity.pointsToEarn > 0) {
        const [fromWallet, toWallet] = await Promise.all([
          WalletService.findMemberWalletOrThrow(ctx, currentUserId, communityId, tx),
          WalletService.createMemberWalletIfNeeded(ctx, userId, communityId, tx),
        ]);

        const { fromWalletId, toWalletId } = await WalletValidator.validateTransferMemberToMember(
          fromWallet,
          toWallet,
          opportunity.pointsToEarn,
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
    const evaluation = await EvaluationService.createEvaluation(
      ctx,
      input,
      EvaluationStatus.FAILED,
    );
    return EvaluationPresenter.create(evaluation);
  }
}
