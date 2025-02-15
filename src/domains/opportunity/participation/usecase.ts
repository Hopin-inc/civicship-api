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
import ParticipationService from "@/domains/opportunity/participation/service";
import ParticipationOutputFormat from "@/domains/opportunity/participation/presenter/output";
import ParticipationUtils from "@/domains/opportunity/participation/utils";
import { PrismaClientIssuer } from "@/prisma/client";
import { getCurrentUserId } from "@/utils";
import { OpportunityCategory, ParticipationStatus, Prisma } from "@prisma/client";
import OpportunityRepository from "@/domains/opportunity/repository";
import ParticipationInputFormat from "@/domains/opportunity/participation/presenter/input";
import MembershipService from "@/domains/membership/service";
import WalletService from "@/domains/membership/wallet/service";
import ParticipationRepository from "@/domains/opportunity/participation/repository";
import ParticipationStatusHistoryService from "@/domains/opportunity/participationStatusHistory/service";
import TransactionService from "@/domains/transaction/service";

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
    const userId = getCurrentUserId(ctx);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const participation = await ParticipationRepository.find(ctx, id, tx);
      if (!participation) {
        throw new Error(`Participation not found: id=${id}`);
      }

      const updated = await ParticipationRepository.setStatus(
        ctx,
        id,
        ParticipationStatus.PARTICIPATING,
        tx,
      );

      const communityId =
        participation.communityId ?? participation.opportunity?.communityId ?? null;
      if (!communityId) {
        throw new Error(`Cannot determine communityId from participation: id=${id}`);
      }
      await MembershipService.joinIfNeeded(ctx, userId, communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, userId, communityId, tx);

      await ParticipationStatusHistoryService.recordParticipationHistory(
        ctx,
        tx,
        id,
        ParticipationStatus.PARTICIPATING,
        userId,
      );

      return ParticipationOutputFormat.setStatus(updated);
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
    const userId = getCurrentUserId(ctx);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const opportunity = await OpportunityRepository.find(ctx, input.opportunityId, tx);
      if (!opportunity) {
        throw new Error(`OpportunityNotFound: ID=${input.opportunityId}`);
      }

      const data: Prisma.ParticipationCreateInput = ParticipationInputFormat.apply(
        input,
        userId,
        opportunity.community.id,
      );

      const participationStatus = opportunity.requireApproval
        ? ParticipationStatus.APPLIED
        : ParticipationStatus.PARTICIPATING;

      if (participationStatus === ParticipationStatus.PARTICIPATING) {
        await MembershipService.joinIfNeeded(ctx, userId, opportunity.community.id, tx);
        await WalletService.createMemberWalletIfNeeded(ctx, userId, opportunity.community.id, tx);
      }

      const participation = await ParticipationRepository.create(
        ctx,
        {
          ...data,
          status: participationStatus,
        },
        tx,
      );

      await ParticipationStatusHistoryService.recordParticipationHistory(
        ctx,
        tx,
        participation.id,
        participationStatus,
        userId,
      );

      return ParticipationOutputFormat.apply(participation);
    });
  }

  static async userCancelMyApplication(
    { id }: GqlMutationParticipationCancelMyApplicationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.cancelApplication(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async managerAcceptApplication(
    { id, input }: GqlMutationParticipationAcceptApplicationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const userId = getCurrentUserId(ctx);

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const participation = await ParticipationRepository.find(ctx, id, tx);
      if (!participation) {
        throw new Error(`Participation not found: id=${id}`);
      }

      const updated = await ParticipationRepository.setStatus(
        ctx,
        id,
        ParticipationStatus.PARTICIPATING,
        tx,
      );

      await MembershipService.joinIfNeeded(ctx, userId, input.communityId, tx);
      await WalletService.createMemberWalletIfNeeded(ctx, userId, input.communityId, tx);

      await ParticipationStatusHistoryService.recordParticipationHistory(
        ctx,
        tx,
        id,
        ParticipationStatus.PARTICIPATING,
        userId,
      );

      return ParticipationOutputFormat.setStatus(updated);
    });
  }

  static async managerDenyApplication(
    { id }: GqlMutationParticipationDenyApplicationArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const res = await ParticipationService.denyApplication(ctx, id);
    return ParticipationOutputFormat.setStatus(res);
  }

  static async managerApprovePerformance(
    { id, input }: GqlMutationParticipationApprovePerformanceArgs,
    ctx: IContext,
  ): Promise<GqlParticipationSetStatusPayload> {
    const userId = getCurrentUserId(ctx);
    const { communityId } = input;

    return this.issuer.public(ctx, async (tx: Prisma.TransactionClient) => {
      const updated = await ParticipationRepository.setStatus(
        ctx,
        id,
        ParticipationStatus.APPROVED,
        tx,
      );

      if (!communityId) {
        throw new Error(`communityId is required for managerApprovePerformance`);
      }

      const participation = await ParticipationRepository.find(ctx, id, tx);
      if (!participation) {
        throw new Error(`Participation not found: id=${id}`);
      }

      const { opportunity } = await ParticipationUtils.validateParticipation(
        ctx,
        tx,
        participation,
      );

      if (opportunity.pointsRequired && opportunity.category === OpportunityCategory.QUEST) {
        const fromPointChange = -opportunity.pointsRequired;
        const toPointChange = opportunity.pointsRequired;

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

      await ParticipationStatusHistoryService.recordParticipationHistory(
        ctx,
        tx,
        id,
        ParticipationStatus.APPROVED,
        userId,
      );

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
}
