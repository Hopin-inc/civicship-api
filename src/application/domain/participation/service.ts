import {
  GqlParticipationCreatePersonalRecordInput,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import ParticipationConverter from "@/application/domain/participation/data/converter";
import ParticipationRepository from "@/application/domain/participation/data/repository";
import { IContext } from "@/types/server";
import { getCurrentUserId } from "@/application/domain/utils";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { PrismaParticipation } from "@/application/domain/participation/data/type";

export default class ParticipationService {
  static async fetchParticipations<T extends Prisma.ParticipationInclude>(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryParticipationsArgs,
    take: number,
    include?: T,
  ): Promise<Prisma.ParticipationGetPayload<{ include: T }>[]> {
    const where = ParticipationConverter.filter(filter ?? {});
    const orderBy = ParticipationConverter.sort(sort ?? {});
    return await ParticipationRepository.query(ctx, where, orderBy, take, cursor, include);
  }

  static async findParticipation(ctx: IContext, id: string) {
    return await ParticipationRepository.find(ctx, id);
  }

  static async findParticipationOrThrow(ctx: IContext, id: string) {
    const participation = await ParticipationRepository.find(ctx, id);
    if (!participation) {
      throw new NotFoundError(`ParticipationNotFound: ID=${id}`);
    }
    return participation;
  }

  static async createParticipation(
    ctx: IContext,
    input: GqlParticipationCreatePersonalRecordInput,
    currentUserId: string,
    tx: Prisma.TransactionClient,
  ) {
    const data: Prisma.ParticipationCreateInput = ParticipationConverter.create(
      input,
      currentUserId,
    );
    return ParticipationRepository.create(ctx, data, tx);
  }

  static async deleteParticipation(ctx: IContext, id: string) {
    await this.findParticipationOrThrow(ctx, id);
    return ParticipationRepository.delete(ctx, id);
  }

  static async setStatus(
    ctx: IContext,
    id: string,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    currentUserId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const userId = currentUserId ?? getCurrentUserId(ctx);

    const data: Prisma.ParticipationUpdateInput = ParticipationConverter.setStatus(
      userId,
      status,
      reason,
    );
    return ParticipationRepository.setStatus(ctx, id, data, tx);
  }

  static async bulkSetStatusByReservation(
    ctx: IContext,
    ids: string[],
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    tx: Prisma.TransactionClient,
  ) {
    return ParticipationRepository.bulkSetParticipationStatus(ctx, ids, { status, reason }, tx);
  }

  static async bulkCancelParticipationsByOpportunitySlot(
    ctx: IContext,
    ids: string[],
    tx: Prisma.TransactionClient,
  ) {
    return ParticipationRepository.bulkSetParticipationStatus(
      ctx,
      ids,
      {
        status: ParticipationStatus.NOT_PARTICIPATING,
        reason: ParticipationStatusReason.OPPORTUNITY_CANCELED,
      },
      tx,
    );
  }

  static validateDeletable(participation: PrismaParticipation) {
    if (participation.reason !== ParticipationStatusReason.PERSONAL_RECORD) {
      throw new ValidationError("Only personal participation records can be deleted.", [
        `participation.reason: ${participation.reason}`,
      ]);
    }
  }
}
