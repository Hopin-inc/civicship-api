import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  PrismaVoteTopic,
  PrismaVoteTopicBase,
  PrismaVoteGate,
  PrismaVotePowerPolicy,
  PrismaVoteOption,
  PrismaVoteBallot,
} from "./type";
import {
  GqlVoteCastInput,
  GqlVoteGateInput,
  GqlVotePowerPolicyInput,
  GqlVoteOptionInput,
} from "@/types/graphql";

export interface IVoteRepository {
  findTopic(ctx: IContext, id: string): Promise<PrismaVoteTopic | null>;

  findTopicOrThrow(ctx: IContext, id: string): Promise<PrismaVoteTopic>;

  queryTopics(
    ctx: IContext,
    communityId: string,
    take: number,
    cursor?: string,
  ): Promise<PrismaVoteTopicBase[]>;

  countTopics(ctx: IContext, communityId: string): Promise<number>;

  createGate(
    ctx: IContext,
    topicId: string,
    input: GqlVoteGateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVoteGate>;

  createPowerPolicy(
    ctx: IContext,
    topicId: string,
    input: GqlVotePowerPolicyInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVotePowerPolicy>;

  createTopic(
    ctx: IContext,
    data: Prisma.VoteTopicCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVoteTopicBase>;

  createOptions(
    ctx: IContext,
    topicId: string,
    options: GqlVoteOptionInput[],
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVoteOption[]>;

  deleteTopic(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVoteTopicBase>;

  findBallot(
    ctx: IContext,
    userId: string,
    topicId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaVoteBallot | null>;

  upsertBallot(
    ctx: IContext,
    userId: string,
    input: GqlVoteCastInput,
    power: number,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVoteBallot>;

  incrementOptionCount(
    ctx: IContext,
    optionId: string,
    power: number,
    tx: Prisma.TransactionClient,
  ): Promise<void>;

  decrementOptionCount(
    ctx: IContext,
    optionId: string,
    power: number,
    tx: Prisma.TransactionClient,
  ): Promise<void>;
}
