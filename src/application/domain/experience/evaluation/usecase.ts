import { inject, injectable } from "tsyringe";
import {
  GqlEvaluation,
  GqlEvaluationBulkCreatePayload,
  GqlEvaluationItem,
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

    const createdEvaluations = await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      return Promise.all(
        input.evaluations.map((item) =>
          this.createEvaluationOnly(ctx, tx, {
            item,
            currentUserId,
          }),
        ),
      );
    });

    for (const evaluation of createdEvaluations) {
      if (evaluation.status === GqlEvaluationStatus.Passed) {
        await this.handlePointTransferSeparately(ctx, evaluation, currentUserId, communityId);
      }
    }

    for (const evaluation of createdEvaluations) {
      void this.issueEvaluationVC(ctx, evaluation);
    }

    return EvaluationPresenter.bulkCreate(createdEvaluations);
  }

  private async createEvaluationOnly(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    params: {
      item: GqlEvaluationItem;
      currentUserId: string;
    },
  ): Promise<PrismaEvaluation> {
    const { item, currentUserId } = params;

    await this.validateEvaluatable(ctx, item.participationId);

    const evaluation = await this.evaluationService.createEvaluation(
      ctx,
      currentUserId,
      { participationId: item.participationId, comment: item.comment },
      item.status,
      tx,
    );

    const reason =
      evaluation.participation.reservation != null
        ? GqlParticipationStatusReason.ReservationAccepted
        : GqlParticipationStatusReason.PersonalRecord;

    await this.participationService.setStatus(
      ctx,
      item.participationId,
      GqlParticipationStatus.Participated,
      reason,
      tx,
      currentUserId,
    );

    return evaluation;
  }

  private async handlePointTransferSeparately(
    ctx: IContext,
    evaluation: PrismaEvaluation,
    currentUserId: string,
    communityId: string,
  ): Promise<void> {
    try {
      await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
        await this.handlePassedEvaluationSideEffects(ctx, tx, evaluation, currentUserId, communityId);
      });
    } catch (error) {
      logger.warn("Point transfer failed for evaluation", {
        evaluationId: evaluation.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
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

  async issueEvaluationVC(ctx: IContext, evaluation: PrismaEvaluation): Promise<void> {
    try {
      const { participation, userId } =
        this.evaluationService.validateParticipationHasOpportunity(evaluation);
      const user = participation.user;
      const phoneIdentity = user?.identities.find((i) => i.platform === IdentityPlatform.PHONE);
      const phoneUid = phoneIdentity?.uid;

      if (!phoneUid) return;

      const vcRequest = this.vcIssuanceRequestConverter.toVCIssuanceRequestInput(evaluation);

      void this.vcIssuanceRequestService.requestVCIssuance(
        userId,
        phoneUid,
        vcRequest,
        ctx,
        evaluation.id,
      );
    } catch (error) {
      logger.warn("tryIssueEvaluationVC failed (non-blocking)", error);
    }
  }
}
