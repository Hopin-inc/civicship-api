import { PrismaParticipation } from "./type";
import { IContext } from "@/types/server";
import {
  GqlParticipationCreatePersonalRecordInput,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";

export interface IParticipationService {
  fetchParticipations<T extends Prisma.ParticipationInclude>(
    ctx: IContext,
    args: GqlQueryParticipationsArgs,
    take: number,
    include?: T,
  ): Promise<Prisma.ParticipationGetPayload<{ include: T }>[]>;

  findParticipation(ctx: IContext, id: string): Promise<PrismaParticipation | null>;

  findParticipationOrThrow(ctx: IContext, id: string): Promise<PrismaParticipation>;

  createParticipation(
    ctx: IContext,
    input: GqlParticipationCreatePersonalRecordInput,
    currentUserId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipation>;

  deleteParticipation(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipation>;

  setStatus(
    ctx: IContext,
    id: string,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    tx: Prisma.TransactionClient,
    currentUserId?: string,
  ): Promise<PrismaParticipation>;

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

  validateDeletable(participation: PrismaParticipation): void;
}

export interface IParticipationRepository {
  query<T extends Prisma.ParticipationInclude>(
    ctx: IContext,
    where: Prisma.ParticipationWhereInput,
    orderBy: Prisma.ParticipationOrderByWithRelationInput[],
    take: number,
    cursor?: string,
    include?: T,
  ): Promise<Prisma.ParticipationGetPayload<{ include: T }>[]>;

  find(ctx: IContext, id: string): Promise<PrismaParticipation | null>;

  create(
    ctx: IContext,
    data: Prisma.ParticipationCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipation>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.ParticipationUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipation>;

  delete(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaParticipation>;

  bulkSetStatusByReservation(
    ctx: IContext,
    participationIds: string[],
    status: PrismaParticipation["status"],
    reason: PrismaParticipation["reason"],
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload>;
}
