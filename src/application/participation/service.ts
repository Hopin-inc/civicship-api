import {
  GqlParticipationApplyInput,
  GqlParticipationInviteInput,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import ParticipationConverter from "@/application/participation/data/converter";
import ParticipationRepository from "@/application/participation/data/repository";
import { IContext } from "@/types/server";
import { getCurrentUserId } from "@/utils";
import { PrismaParticipation } from "@/application/participation/data/type";
import OpportunityRepository from "@/application/opportunity/data/repository";
import { NotFoundError } from "@/errors/graphql";
import { PrismaOpportunity } from "@/application/opportunity/data/type";

export default class ParticipationService {
  static async fetchParticipations(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryParticipationsArgs,
    take: number,
  ) {
    const where = ParticipationConverter.filter(filter ?? {});
    const orderBy = ParticipationConverter.sort(sort ?? {});

    return await ParticipationRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findParticipation(ctx: IContext, id: string) {
    return await ParticipationRepository.find(ctx, id);
  }

  static async findParticipationOrThrow(ctx: IContext, id: string) {
    const participation = await ParticipationRepository.find(ctx, id);
    if (!participation) {
      throw new Error(`ParticipationNotFound: ID=${id}`);
    }
    return participation;
  }

  static async applyParticipation(
    ctx: IContext,
    input: GqlParticipationApplyInput,
    currentUserId: string,
    communityId: string,
    participationStatus: ParticipationStatus,
  ) {
    const data: Prisma.ParticipationCreateInput = ParticipationConverter.apply(
      input,
      currentUserId,
      communityId,
      participationStatus,
    );
    return await ParticipationRepository.create(ctx, data);
  }

  static async inviteParticipation(ctx: IContext, input: GqlParticipationInviteInput) {
    const currentUserId = getCurrentUserId(ctx);
    const data: Prisma.ParticipationCreateInput = ParticipationConverter.invite(
      input,
      currentUserId,
    );

    return await ParticipationRepository.create(ctx, data);
  }

  static async setStatus(
    ctx: IContext,
    id: string,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    tx?: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx);
    const data: Prisma.ParticipationUpdateInput = ParticipationConverter.setStatus(
      currentUserId,
      status,
      reason,
    );
    return ParticipationRepository.setStatus(ctx, id, data, tx);
  }

  static async validateParticipationHasOpportunity(
    ctx: IContext,
    participation: PrismaParticipation,
  ): Promise<PrismaOpportunity> {
    if (!participation.opportunityId) {
      throw new NotFoundError("Opportunity", { id: participation.opportunityId });
    }

    const opportunity = await OpportunityRepository.find(ctx, participation.opportunityId);
    if (!opportunity) {
      throw new NotFoundError("Opportunity", { id: participation.opportunityId });
    }

    return opportunity;
  }

  static async validateParticipationHasUserId(
    ctx: IContext,
    participation: PrismaParticipation,
  ): Promise<string> {
    if (!participation.userId) {
      throw new NotFoundError("Participated user", { userId: participation.userId });
    }

    return participation.userId;
  }
}
