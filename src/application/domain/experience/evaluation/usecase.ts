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
import {
  PrismaEvaluation,
  PrismaEvaluationDetail,
} from "@/application/domain/experience/evaluation/data/type";
import WalletService from "@/application/domain/account/wallet/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import { clampFirst, getCurrentUserId } from "@/application/domain/utils";
import { ITransactionService } from "@/application/domain/transaction/data/interface";
import ParticipationService from "@/application/domain/experience/participation/service";
import { CannotEvaluateBeforeOpportunityStartError, ValidationError } from "@/errors/graphql";
import { IdentityPlatform, ParticipationStatusReason, Prisma } from "@prisma/client";
import { VCIssuanceService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import { VCIssuanceRequestInput } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/type";
import { toVCIssuanceRequestInput } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/converter";

@injectable()
export default class EvaluationUseCase {
  constructor(
    @inject("EvaluationService") private readonly evaluationService: EvaluationService,
    @inject("ParticipationService") private readonly participationService: ParticipationService,
    @inject("TransactionService") private readonly transactionService: ITransactionService,
    @inject("WalletService") private readonly walletService: WalletService,
    @inject("WalletValidator") private readonly walletValidator: WalletValidator,
    @inject("VCIssuanceService") private readonly vcIssuanceService: VCIssuanceService,
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

    const createdEvaluations = await ctx.issuer.public(ctx, async (tx) => {
      return Promise.all(
        input.evaluations.map((item) =>
          this.createOneEvaluationWithSideEffects(ctx, tx, {
            item,
            currentUserId,
            communityId,
          }),
        ),
      );
    });

    return EvaluationPresenter.bulkCreate(createdEvaluations);
  }

  private async createOneEvaluationWithSideEffects(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    params: {
      item: GqlEvaluationItem;
      currentUserId: string;
      communityId: string;
    },
  ): Promise<PrismaEvaluationDetail> {
    const { item, currentUserId, communityId } = params;

    await this.validateEvaluatable(ctx, item.participationId);

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
      await this.handlePassedEvaluationSideEffects(ctx, tx, evaluation, currentUserId, communityId);
    }

    return evaluation;
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

    const nowJSTDate = new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
    const startsAtJSTDate = new Date(startsAt).toLocaleDateString("ja-JP", {
      timeZone: "Asia/Tokyo",
    });

    if (nowJSTDate < startsAtJSTDate) {
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
    const user = participation.user;

    const phoneIdentity = user?.identities.find((i) => i.platform === IdentityPlatform.PHONE);
    const phoneUid = phoneIdentity?.uid;

    if (phoneUid) {
      const vcRequest: VCIssuanceRequestInput = toVCIssuanceRequestInput(evaluation);
      await this.vcIssuanceService.requestVCIssuance(userId, phoneUid, vcRequest, ctx);
    }

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
