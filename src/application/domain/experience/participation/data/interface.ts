import { IContext } from "@/types/server";
import {
  GqlParticipationBulkCreateInput,
  GqlParticipationCreatePersonalRecordInput,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import {
  PrismaParticipationDetail,
  PrismaParticipationIncludeSlot,
} from "@/application/domain/experience/participation/data/type";

export interface IParticipationService {
  fetchParticipations<T extends Prisma.ParticipationInclude>(
    ctx: IContext,
    args: GqlQueryParticipationsArgs,
    take: number,
    include?: T,
  ): Promise<PrismaParticipationDetail[]>;

  findParticipation(ctx: IContext, id: string): Promise<PrismaParticipationDetail | null>;

  findParticipationOrThrow(ctx: IContext, id: string): Promise<PrismaParticipationDetail>;

  bulkCreateParticipations(
    ctx: IContext,
    items: GqlParticipationBulkCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipationDetail[]>;

  createParticipation(
    ctx: IContext,
    input: GqlParticipationCreatePersonalRecordInput,
    currentUserId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipationDetail>;

  deleteParticipation(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipationDetail>;

  setStatus(
    ctx: IContext,
    id: string,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    tx: Prisma.TransactionClient,
    currentUserId?: string,
  ): Promise<PrismaParticipationDetail>;

  bulkSetStatusByReservation(
    ctx: IContext,
    ids: string[],
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload>;

  bulkCancelParticipationsByOpportunitySlot(
    ctx: IContext,
    ids: string[],
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload>;

  validateDeletable(participation: PrismaParticipationDetail): void;
}

export interface IParticipationRepository {
  query(
    ctx: IContext,
    where: Prisma.ParticipationWhereInput,
    orderBy: Prisma.ParticipationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaParticipationDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaParticipationDetail | null>;
  findWithSlot(ctx: IContext, id: string): Promise<PrismaParticipationIncludeSlot | null>;

  create(
    ctx: IContext,
    data: Prisma.ParticipationCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipationDetail>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.ParticipationUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipationDetail>;

  delete(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipationDetail>;

  bulkSetStatusByReservation(
    ctx: IContext,
    participationIds: string[],
    status: PrismaParticipationDetail["status"],
    reason: PrismaParticipationDetail["reason"],
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload>;
}
