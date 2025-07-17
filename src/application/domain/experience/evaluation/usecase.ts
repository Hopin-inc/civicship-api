import { inject, injectable } from "tsyringe";
import {
  GqlEvaluation,
  GqlEvaluationBulkCreatePayload,
  GqlEvaluationsConnection,
  GqlMutationEvaluationBulkCreateArgs,
  GqlParticipationStatus,
  GqlParticipationStatusReason,
  GqlQueryEvaluationArgs,
  GqlQueryEvaluationsArgs,
} from "@/types/graphql";
import { GqlEvaluationStatus } from "@/types/graphql";
import { IContext } from "@/types/server";
import EvaluationService from "@/application/domain/experience/evaluation/service";
import EvaluationPresenter from "@/application/domain/experience/evaluation/presenter";
import { PrismaEvaluation } from "@/application/domain/experience/evaluation/data/type";
import WalletService from "@/application/domain/account/wallet/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { ITransactionService } from "@/application/domain/transaction/data/interface";
import ParticipationService from "@/application/domain/experience/participation/service";
import { CannotEvaluateBeforeOpportunityStartError, ValidationError } from "@/errors/graphql";
import { IdentityPlatform, ParticipationStatusReason, Prisma } from "@prisma/client";
import { VCIssuanceRequestService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import VCIssuanceRequestConverter from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/converter";
import logger from "@/infrastructure/logging";

@injectable()
export default class EvaluationUseCase {
  constructor(
    @inject("EvaluationService") private readonly evaluationService: EvaluationService,
    @inject("ParticipationService") private readonly participationService: ParticipationService,
    @inject("TransactionService") private readonly transactionService: ITransactionService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("WalletValidator") private readonly walletValidator: WalletValidator,
    @inject("VCIssuanceRequestService")
    private readonly vcIssuanceRequestService: VCIssuanceRequestService,
    @inject("VCIssuanceRequestConverter")
    private readonly vcIssuanceRequestConverter: VCIssuanceRequestConverter,
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

  async managerBulkCreateEvaluations(
    { input, permission }: GqlMutationEvaluationBulkCreateArgs,
    ctx: IContext,
  ): Promise<GqlEvaluationBulkCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);
    const communityId = permission.communityId;

    const createdEvaluations = await this.createEvaluationsAndUpdateStatus(
      ctx,
      input.evaluations,
      currentUserId,
    );

    await this.processPassedEvaluationEffects(ctx, createdEvaluations, currentUserId, communityId);

    return EvaluationPresenter.bulkCreate(createdEvaluations);
  }

  private async handlePointTransferSeparately(
    ctx: IContext,
    evaluation: PrismaEvaluation,
    currentUserId: string,
    communityId: string,
  ): Promise<void> {
    try {
      await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
        await this.handlePassedEvaluationSideEffects(
          ctx,
          tx,
          evaluation,
          currentUserId,
          communityId,
        );
      });
    } catch (error) {
      logger.warn("Point transfer failed for evaluation", {
        evaluationId: evaluation.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async createEvaluationsAndUpdateStatus(
    ctx: IContext,
    evaluations: Array<{ participationId: string; status: GqlEvaluationStatus; comment?: string }>,
    currentUserId: string,
  ): Promise<PrismaEvaluation[]> {
    return await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      await Promise.all(
        evaluations.map((item) => this.validateEvaluatable(ctx, item.participationId)),
      );

      const evaluationCreateInputs = evaluations.map((item) => ({
        participationId: item.participationId,
        status: item.status,
        comment: item.comment,
      }));

      const createdEvaluations = await this.evaluationService.bulkCreateEvaluations(
        ctx,
        evaluationCreateInputs,
        currentUserId,
        tx,
      );

      await this.bulkUpdateParticipationStatus(ctx, createdEvaluations, currentUserId, tx);

      return createdEvaluations;
    });
  }

  private async bulkUpdateParticipationStatus(
    ctx: IContext,
    evaluations: PrismaEvaluation[],
    currentUserId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await Promise.all(
      evaluations.map((evaluation) => {
        const reason =
          evaluation.participation.reservation != null
            ? GqlParticipationStatusReason.ReservationAccepted
            : GqlParticipationStatusReason.PersonalRecord;

        return this.participationService.setStatus(
          ctx,
          evaluation.participationId,
          GqlParticipationStatus.Participated,
          reason,
          tx,
          currentUserId,
        );
      }),
    );
  }

  private async processPassedEvaluationEffects(
    ctx: IContext,
    evaluations: PrismaEvaluation[],
    currentUserId: string,
    communityId: string,
  ): Promise<void> {
    const passedEvaluationData = this.preparePassedEvaluationData(evaluations);

    await Promise.allSettled([
      this.processVCIssuanceRequests(ctx, passedEvaluationData),
      this.processPointTransfers(ctx, passedEvaluationData, currentUserId, communityId),
    ]);
  }

  private preparePassedEvaluationData(evaluations: PrismaEvaluation[]): Array<{
    evaluation: PrismaEvaluation;
    userId: string;
    hasPhoneAuth: boolean;
    isPassed: boolean;
  }> {
    return evaluations
      .map((evaluation) => {
        try {
          const { userId, participation } =
            this.evaluationService.validateParticipationHasOpportunity(evaluation);
          const user = participation.user;
          const hasPhoneAuth =
            user?.identities.some((i) => i.platform === IdentityPlatform.PHONE) ?? false;
          const isPassed = evaluation.status === GqlEvaluationStatus.Passed;

          return { evaluation, userId, hasPhoneAuth, isPassed };
        } catch {
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  private async processVCIssuanceRequests(
    ctx: IContext,
    evaluationData: Array<{
      evaluation: PrismaEvaluation;
      userId: string;
      hasPhoneAuth: boolean;
      isPassed: boolean;
    }>,
  ): Promise<void> {
    const vcEligibleEvaluations = evaluationData
      .filter(({ isPassed, hasPhoneAuth }) => isPassed && hasPhoneAuth)
      .map(({ evaluation, userId }) => ({ evaluation, userId }));

    if (vcEligibleEvaluations.length === 0) return;

    try {
      const vcIssuanceData =
        this.vcIssuanceRequestConverter.createManyInputs(vcEligibleEvaluations);
      await this.vcIssuanceRequestService.bulkCreateVCIssuanceRequests(ctx, vcIssuanceData);
    } catch (error) {
      logger.warn("Bulk VC issuance request creation failed", {
        count: vcEligibleEvaluations.length,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async processPointTransfers(
    ctx: IContext,
    evaluationData: Array<{ evaluation: PrismaEvaluation; userId: string; isPassed: boolean }>,
    currentUserId: string,
    communityId: string,
  ): Promise<void> {
    const passedEvaluations = evaluationData
      .filter(({ isPassed }) => isPassed)
      .map(({ evaluation }) => evaluation);

    const results = await Promise.allSettled(
      passedEvaluations.map((evaluation) =>
        this.handlePointTransferSeparately(ctx, evaluation, currentUserId, communityId),
      ),
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        logger.warn("Point transfer failed for evaluation", {
          evaluationId: passedEvaluations[index].id,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        });
      }
    });
  }

  private async validateEvaluatable(ctx: IContext, participationId: string) {
    const participation = await this.participationService.findParticipationWithSlotOrThrow(
      ctx,
      participationId,
    );
    await this.evaluationService.throwIfExist(ctx, participationId);

    const startsAt =
      participation.reason === ParticipationStatusReason.PERSONAL_RECORD
        ? participation.opportunitySlot?.startsAt
        : participation.reservation?.opportunitySlot?.startsAt;

    if (!startsAt) {
      throw new ValidationError("OpportunitySlot startsAt is undefined.");
    }

    const now = new Date();
    const startsAtDate = new Date(startsAt);

    if (now < startsAtDate) {
      // Date オブジェクトとして比較
      throw new CannotEvaluateBeforeOpportunityStartError();
    }
  }

  private async handlePassedEvaluationSideEffects(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    evaluation: PrismaEvaluation,
    currentUserId: string,
    communityId: string,
  ): Promise<void> {
    const { participation, opportunity, userId } =
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
}
