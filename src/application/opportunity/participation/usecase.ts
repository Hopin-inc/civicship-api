import {
  GqlCommunity,
  GqlCommunityParticipationsArgs,
  GqlMutationParticipationAcceptApplicationArgs,
  GqlMutationParticipationAcceptMyInvitationArgs,
  GqlMutationParticipationApplyArgs,
  GqlMutationParticipationApprovePerformanceArgs,
  GqlMutationParticipationCancelInvitationArgs,
  GqlMutationParticipationCancelMyApplicationArgs,
  GqlMutationParticipationDenyApplicationArgs,
  GqlMutationParticipationDenyMyInvitationArgs,
  GqlMutationParticipationDenyPerformanceArgs,
  GqlMutationParticipationInviteArgs,
  GqlOpportunity,
  GqlOpportunityParticipationsArgs,
  GqlOpportunitySlot,
  GqlOpportunitySlotParticipationsArgs,
  GqlParticipation,
  GqlParticipationApplyPayload,
  GqlParticipationInvitePayload,
  GqlParticipationsConnection,
  GqlParticipationSetStatusPayload,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
  GqlTransactionGiveRewardPointInput,
  GqlUser,
  GqlUserParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationService from "@/application/opportunity/participation/service";
import ParticipationOutputFormat from "@/presentation/graphql/dto/opportunity/participation/output";
import ParticipationUtils from "@/application/opportunity/participation/utils";
import { getCurrentUserId } from "@/utils";
import { OpportunityCategory, ParticipationStatus, Prisma, UtilityStatus } from "@prisma/client";
import MembershipService from "@/application/membership/service";
import WalletService from "@/application/membership/wallet/service";
import ParticipationInputFormat from "@/presentation/graphql/dto/opportunity/participation/input";
import TransactionService from "@/application/transaction/service";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import OpportunityRequiredUtilityRepository from "@/infrastructure/prisma/repositories/opportunity/requiredUtility";
import UtilityHistoryService from "@/application/utility/history/service";
import OpportunityService from "@/application/opportunity/service";
import OpportunityRequiredUtilityService from "@/application/opportunity/requiredUtility/service";

export default class ParticipationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseParticipations(
    { cursor, filter, sort, first }: GqlQueryParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      sort,
      filter,
      first,
    });
  }

  static async visitorBrowseParticipationsByCommunity(
    { id }: GqlCommunity,
    { first, cursor }: GqlCommunityParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      filter: { communityId: id },
      first,
    });
  }

  static async visitorBrowseParticipationsByUser(
    { id }: GqlUser,
    { first, cursor }: GqlUserParticipationsArgs,
    ctx: IContext,
  ) {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      filter: { userId: id },
      first,
    });
  }

  static async visitorBrowseParticipationsByOpportunity(
    { id }: GqlOpportunity,
    { first, cursor }: GqlOpportunityParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      filter: { opportunityId: id },
      first,
    });
  }

  static async visitorBrowseParticipationsByOpportunitySlot(
    { id }: GqlOpportunitySlot,
    { first, cursor }: GqlOpportunitySlotParticipationsArgs,
    ctx: IContext,
  ): Promise<GqlParticipationsConnection> {
    return ParticipationUtils.fetchParticipationsCommon(ctx, {
      cursor,
      filter: { opportunitySlotId: id },
      first,
    });
  }

  static async visitorViewParticipation(
    { id }: GqlQueryParticipationArgs,
    ctx: IContext,
  ): Promise<GqlParticipation | null> {
    const res = await ParticipationService.findParticipation(ctx, id);
    if (!res) {
      return null;
    }
    return ParticipationOutputFormat.get(res);
  }

  static async memberInviteUserToOpportunity(
    { input }: GqlMutationParticipationInviteArgs,
    ctx: IContext,
  ): Promise<GqlParticipationInvitePayload> {
    const res = await ParticipationService.inviteParticipation(ctx, input);
    return ParticipationOutputFormat.invite(res);
  }

  static async memberCancelInvitation(
    { id }: GqlMutationParticipationCancelInvitationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.cancelInvitation(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async userAcceptMyInvitation(
    { id }: GqlMutationParticipationAcceptMyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);

    const participation = await ParticipationService.findParticipationOrThrow(ctx, id);
    const { communityId } = ParticipationUtils.extractParticipationData(participation);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const res = await ParticipationUtils.setParticipationStatus(
        ctx,
        id,
        currentUserId,
        ParticipationStatus.PARTICIPATING,
        tx,
      );

      await MembershipService.joinIfNeeded(ctx, currentUserId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, communityId, tx);

      return ParticipationOutputFormat.setStatus(res);
    });
  }

  static async userDenyMyInvitation(
    { id }: GqlMutationParticipationDenyMyInvitationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.denyInvitation(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async userApplyForOpportunity(
    { input }: GqlMutationParticipationApplyArgs,
    ctx: IContext,
  ): Promise<GqlParticipationApplyPayload> {
    const currentUserId = getCurrentUserId(ctx);
    const opportunity = await OpportunityService.findOpportunityOrThrow(ctx, input.opportunityId);
    const { community, requireApproval } = opportunity;

    const participationStatus = requireApproval
      ? ParticipationStatus.APPLIED
      : ParticipationStatus.PARTICIPATING;

    const participationData: Prisma.ParticipationCreateInput = ParticipationInputFormat.apply(
      input,
      currentUserId,
      community.id,
      participationStatus,
    );

    const requiredUtilities = await OpportunityRequiredUtilityRepository.queryByOpportunityId(
      ctx,
      opportunity.id,
    );

    const consumeUtility = async (tx: Prisma.TransactionClient) => {
      if (requiredUtilities.length > 0 && input.utilityId && input.userWalletId) {
        const utilityStatus =
          participationStatus === ParticipationStatus.PARTICIPATING
            ? UtilityStatus.USED
            : UtilityStatus.RESERVED;

        await UtilityHistoryService.consumeFirstAvailableUtilityForOpportunity(
          ctx,
          requiredUtilities,
          input.userWalletId,
          input.utilityId,
          utilityStatus,
          tx,
        );
      }
    };

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      if (participationStatus === ParticipationStatus.PARTICIPATING) {
        await MembershipService.joinIfNeeded(ctx, currentUserId, community.id, tx);
        await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, community.id, tx);
      }

      await consumeUtility(tx);

      const participation = await ParticipationService.applyParticipation(
        ctx,
        currentUserId,
        participationData,
        participationStatus,
        tx,
      );

      return ParticipationOutputFormat.apply(participation);
    });
  }

  static async userCancelMyApplication(
    { id, input }: GqlMutationParticipationCancelMyApplicationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const participation = await ParticipationService.findParticipationOrThrow(ctx, id);
    const { opportunityId, participantId } =
      ParticipationUtils.extractParticipationData(participation);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await this.refundUtility(
        ctx,
        opportunityId,
        participantId,
        input.communityId,
        tx,
        input.utilityId,
      );

      const res = await ParticipationService.cancelApplication(ctx, id, tx);
      return ParticipationOutputFormat.setStatus(res);
    });
  }

  static async managerAcceptApplication(
    { id, input }: GqlMutationParticipationAcceptApplicationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);
    const participation = await ParticipationService.findParticipationOrThrow(ctx, id);
    const { opportunityId, participantId } =
      ParticipationUtils.extractParticipationData(participation);

    const requiredUtilities = await OpportunityRequiredUtilityRepository.queryByOpportunityId(
      ctx,
      opportunityId,
    );

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const res = await ParticipationUtils.setParticipationStatus(
        ctx,
        id,
        currentUserId,
        ParticipationStatus.PARTICIPATING,
        tx,
      );

      await MembershipService.joinIfNeeded(ctx, currentUserId, input.communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, currentUserId, input.communityId, tx);

      if (requiredUtilities.length > 0 && input.utilityId) {
        const memberWallet = await WalletService.findMemberWalletOrThrow(
          ctx,
          participantId,
          input.communityId,
        );

        const reservedUtility =
          await OpportunityRequiredUtilityService.checkIfReservedUtilityExists(
            ctx,
            memberWallet.id,
            input.utilityId,
          );

        await UtilityHistoryService.consumeFirstAvailableUtilityForOpportunity(
          ctx,
          requiredUtilities,
          memberWallet.id,
          reservedUtility.utilityId,
          UtilityStatus.USED,
          tx,
        );
      }

      return ParticipationOutputFormat.setStatus(res);
    });
  }

  static async managerDenyApplication(
    { id, input }: GqlMutationParticipationDenyApplicationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const participation = await ParticipationService.findParticipationOrThrow(ctx, id);
    const { opportunityId, participantId } =
      ParticipationUtils.extractParticipationData(participation);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      await this.refundUtility(
        ctx,
        opportunityId,
        participantId,
        input.communityId,
        tx,
        input.utilityId,
      );

      const res = await ParticipationService.denyApplication(ctx, id, tx);
      return ParticipationOutputFormat.setStatus(res);
    });
  }

  static async managerApprovePerformance(
    { id, input }: GqlMutationParticipationApprovePerformanceArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const currentUserId = getCurrentUserId(ctx);
    const { communityId } = input;
    const participation = await ParticipationService.findParticipationOrThrow(ctx, id);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const updated = await ParticipationUtils.setParticipationStatus(
        ctx,
        id,
        currentUserId,
        ParticipationStatus.APPROVED,
        tx,
      );

      const { opportunity } = await ParticipationUtils.validateParticipation(
        ctx,
        tx,
        participation,
      );

      if (opportunity.pointsToEarn && opportunity.category === OpportunityCategory.QUEST) {
        const fromPointChange = -opportunity.pointsToEarn;
        const toPointChange = opportunity.pointsToEarn;

        const { fromWalletId, toWalletId } = await WalletService.findWalletsForGiveReward(
          ctx,
          tx,
          communityId,
          participation.id,
          fromPointChange,
        );

        const inputForTx: GqlTransactionGiveRewardPointInput = {
          fromWalletId,
          fromPointChange,
          toWalletId,
          toPointChange,
          participationId: participation.id,
        };
        await TransactionService.giveRewardPoint(ctx, tx, inputForTx);
      }

      return ParticipationOutputFormat.setStatus(updated);
    });
  }

  static async managerDenyPerformance(
    { id }: GqlMutationParticipationDenyPerformanceArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.denyPerformance(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  private static async refundUtility(
    ctx: IContext,
    opportunityId: string,
    participantId: string,
    communityId: string,
    tx: Prisma.TransactionClient,
    utilityId?: string,
  ): Promise<void> {
    if (utilityId) {
      const memberWallet = await WalletService.findMemberWalletOrThrow(
        ctx,
        participantId,
        communityId,
      );
      const reservedUtility = await OpportunityRequiredUtilityService.checkIfReservedUtilityExists(
        ctx,
        memberWallet.id,
        utilityId,
      );
      const requiredUtilities = await OpportunityRequiredUtilityRepository.queryByOpportunityId(
        ctx,
        opportunityId,
      );
      const { fromWalletId, toWalletId } = await WalletService.findWalletsForRefundUtility(
        ctx,
        memberWallet.id,
        communityId,
        reservedUtility.utility.pointsRequired,
      );
      const transaction = await TransactionService.refundUtility(ctx, tx, {
        fromWalletId,
        toWalletId,
        transferPoints: reservedUtility.utility.pointsRequired,
      });
      await UtilityHistoryService.refundReservedUtilityForOpportunity(
        ctx,
        requiredUtilities,
        reservedUtility.utilityId,
        memberWallet.id,
        tx,
        transaction.id,
      );
    }
  }
}
