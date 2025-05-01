import { IContext } from "@/types/server";
import { Prisma, PublishStatus } from "@prisma/client";
import { PrismaUtility } from "./type";
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
  ): Promise<PrismaUtility[]>;

  findUtility(
    ctx: IContext,
    id: string,
    filter: GqlUtilityFilterInput,
  ): Promise<PrismaUtility | null>;

  findUtilityOrThrow(ctx: IContext, id: string): Promise<PrismaUtility>;

  createUtility(
    ctx: IContext,
    input: GqlUtilityCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaUtility>;

  deleteUtility(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaUtility>;

  updateUtilityInfo(
    ctx: IContext,
    args: GqlMutationUtilityUpdateInfoArgs,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaUtility>;

  validatePublishStatus(allowedStatuses: PublishStatus[], filter?: GqlUtilityFilterInput): void;
}

export interface IUtilityRepository {
  query(
    ctx: IContext,
    where: Prisma.UtilityWhereInput,
    orderBy: Prisma.UtilityOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ): Promise<PrismaUtility[]>;

  find(ctx: IContext, id: string): Promise<PrismaUtility | null>;

  findAccessible(
    ctx: IContext,
    where: Prisma.UtilityWhereUniqueInput & Prisma.UtilityWhereInput,
  ): Promise<PrismaUtility | null>;

  create(
    ctx: IContext,
    data: Prisma.UtilityCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaUtility>;

  delete(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaUtility>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.UtilityUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaUtility>;
}
