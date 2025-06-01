import { IContext } from "@/types/server";
import { Prisma, PublishStatus } from "@prisma/client";
import { PrismaUtilityDetail } from "./type";
import {
  GqlQueryUtilitiesArgs,
  GqlUtilityFilterInput,
  GqlUtilityCreateInput,
  GqlMutationUtilityUpdateInfoArgs,
} from "@/types/graphql";

export interface IUtilityService {
  fetchUtilities(
    ctx: IContext,
    args: GqlQueryUtilitiesArgs,
    take: number,
  ): Promise<PrismaUtilityDetail[]>;

  findUtility(
    ctx: IContext,
    id: string,
    filter: GqlUtilityFilterInput,
  ): Promise<PrismaUtilityDetail | null>;

  findUtilityOrThrow(ctx: IContext, id: string): Promise<PrismaUtilityDetail>;

  createUtility(
    ctx: IContext,
    input: GqlUtilityCreateInput,
    communityId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaUtilityDetail>;

  deleteUtility(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaUtilityDetail>;

  updateUtilityInfo(
    ctx: IContext,
    args: GqlMutationUtilityUpdateInfoArgs,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaUtilityDetail>;

  validatePublishStatus(allowedStatuses: PublishStatus[], filter?: GqlUtilityFilterInput): void;
}

export interface IUtilityRepository {
  query(
    ctx: IContext,
    where: Prisma.UtilityWhereInput,
    orderBy: Prisma.UtilityOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaUtilityDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaUtilityDetail | null>;

  findAccessible(
    ctx: IContext,
    where: Prisma.UtilityWhereUniqueInput & Prisma.UtilityWhereInput,
  ): Promise<PrismaUtilityDetail | null>;

  create(
    ctx: IContext,
    data: Prisma.UtilityCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaUtilityDetail>;

  delete(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaUtilityDetail>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.UtilityUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaUtilityDetail>;
}
