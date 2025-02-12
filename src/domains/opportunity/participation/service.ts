import {
  GqlParticipationApplyInput,
  GqlParticipationInviteInput,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { ParticipationStatus, Prisma } from "@prisma/client";
import ParticipationInputFormat from "@/domains/opportunity/participation/presenter/input";
import ParticipationRepository from "@/domains/opportunity/participation/repository";
import { prismaClient } from "@/prisma/client";
import OpportunityRepository from "@/domains/opportunity/repository";
import { IContext } from "@/types/server";
import { ParticipationUtils } from "@/domains/opportunity/participation/utils";

export default class ParticipationService {
  static async fetchParticipations(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryParticipationsArgs,
    take: number,
  ) {
    const where = ParticipationInputFormat.filter(filter ?? {});
    const orderBy = ParticipationInputFormat.sort(sort ?? {});

    return await ParticipationRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findParticipation(ctx: IContext, id: string) {
    return await ParticipationRepository.find(ctx, id);
  }

  static async inviteParticipation(ctx: IContext, input: GqlParticipationInviteInput) {
    const currentUserId = ctx.currentUser?.id;
    if (!currentUserId) {
      throw new Error("Unauthorized: User must be logged in");
    }

    return await prismaClient.$transaction(async (tx) => {
      const opportunity = await OpportunityRepository.findWithTransaction(
        ctx,
        tx,
        input.opportunityId,
      );

      if (!opportunity) {
        throw new Error(`OpportunityNotFound: ID=${input.opportunityId}`);
      }

      const communityId = opportunity.community.id;
      if (!communityId) {
        throw new Error(`CommunityNotFound: ID=${opportunity.community}`);
      }

      const data: Prisma.ParticipationCreateInput = ParticipationInputFormat.invite(
        input,
        communityId,
      );

      const participation = await ParticipationRepository.createWithTransaction(ctx, tx, {
        ...data,
        status: ParticipationStatus.INVITED,
      });

      await ParticipationUtils.recordParticipationHistory(
        ctx,
        tx,
        participation.id,
        ParticipationStatus.INVITED,
        currentUserId,
      );

      return participation;
    });
  }

  static async applyParticipation(ctx: IContext, input: GqlParticipationApplyInput) {
    const currentUserId = ctx.currentUser?.id;
    if (!currentUserId) {
      throw new Error("Unauthorized: User must be logged in");
    }

    return await prismaClient.$transaction(async (tx) => {
      const opportunity = await OpportunityRepository.findWithTransaction(
        ctx,
        tx,
        input.opportunityId,
      );

      if (!opportunity) {
        throw new Error(`OpportunityNotFound: ID=${input.opportunityId}`);
      }

      const communityId = opportunity.community.id;
      if (!communityId) {
        throw new Error(`CommunityNotFound: ID=${opportunity.community}`);
      }

      const data: Prisma.ParticipationCreateInput = ParticipationInputFormat.apply(
        input,
        currentUserId,
        communityId,
      );

      const participationStatus = opportunity.requireApproval
        ? ParticipationStatus.APPLIED
        : ParticipationStatus.PARTICIPATING;

      const participation = await ParticipationRepository.createWithTransaction(ctx, tx, {
        ...data,
        status: participationStatus,
      });

      await ParticipationUtils.recordParticipationHistory(
        ctx,
        tx,
        participation.id,
        participationStatus,
        currentUserId,
      );

      return participation;
    });
  }

  static async cancelInvitation(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(ctx, id, ParticipationStatus.CANCELED);
  }

  static async acceptInvitation(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(ctx, id, ParticipationStatus.PARTICIPATING);
  }

  static async denyInvitation(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(
      ctx,
      id,
      ParticipationStatus.NOT_PARTICIPATING,
    );
  }

  static async cancelApplication(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(ctx, id, ParticipationStatus.CANCELED);
  }

  static async acceptApplication(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(ctx, id, ParticipationStatus.PARTICIPATING);
  }

  static async denyApplication(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(
      ctx,
      id,
      ParticipationStatus.NOT_PARTICIPATING,
    );
  }

  static async approvePerformance(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(ctx, id, ParticipationStatus.APPROVED, true);
  }

  static async denyPerformance(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(ctx, id, ParticipationStatus.DENIED);
  }
}
