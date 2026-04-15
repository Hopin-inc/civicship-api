import { injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IVoteRepository } from "./interface";
import {
  voteTopicWithRelationsSelect,
  voteGateSelect,
  votePowerPolicySelect,
  voteOptionSelect,
  voteBallotSelect,
  PrismaVoteTopic,
  PrismaVoteGate,
  PrismaVotePowerPolicy,
  PrismaVoteOption,
  PrismaVoteBallot,
} from "./type";
import { NotFoundError } from "@/errors/graphql";
import {
  GqlVoteCastInput,
  GqlVoteGateInput,
  GqlVotePowerPolicyInput,
  GqlVoteOptionInput,
} from "@/types/graphql";

@injectable()
export default class VoteRepository implements IVoteRepository {
  async findTopic(ctx: IContext, id: string, tx?: Prisma.TransactionClient): Promise<PrismaVoteTopic | null> {
    const query = (t: Prisma.TransactionClient) =>
      t.voteTopic.findUnique({
        where: { id },
        select: voteTopicWithRelationsSelect,
      });
    return tx ? query(tx) : ctx.issuer.public(ctx, query);
  }

  async findTopicOrThrow(ctx: IContext, id: string, tx?: Prisma.TransactionClient): Promise<PrismaVoteTopic> {
    const topic = await this.findTopic(ctx, id, tx);
    if (!topic) throw new NotFoundError("VoteTopic", { id });
    return topic;
  }

  async queryTopics(
    ctx: IContext,
    communityId: string,
    take: number,
    cursor?: string,
  ): Promise<PrismaVoteTopic[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.voteTopic.findMany({
        where: { communityId },
        select: voteTopicWithRelationsSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      }),
    );
  }

  async countTopics(ctx: IContext, communityId: string): Promise<number> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.voteTopic.count({ where: { communityId } }),
    );
  }

  async createGate(
    ctx: IContext,
    topicId: string,
    input: GqlVoteGateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVoteGate> {
    return tx.voteGate.create({
      data: {
        type: input.type,
        nftTokenId: input.nftTokenId ?? null,
        requiredRole: input.requiredRole ?? null,
        topicId,
      },
      select: voteGateSelect,
    });
  }

  async createPowerPolicy(
    ctx: IContext,
    topicId: string,
    input: GqlVotePowerPolicyInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVotePowerPolicy> {
    return tx.votePowerPolicy.create({
      data: {
        type: input.type,
        nftTokenId: input.nftTokenId ?? null,
        topicId,
      },
      select: votePowerPolicySelect,
    });
  }

  async createTopic(
    ctx: IContext,
    data: Prisma.VoteTopicCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string }> {
    return tx.voteTopic.create({
      data,
      select: { id: true },
    });
  }

  async createOptions(
    ctx: IContext,
    topicId: string,
    options: GqlVoteOptionInput[],
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVoteOption[]> {
    return Promise.all(
      options.map((opt) =>
        tx.voteOption.create({
          data: {
            topicId,
            label: opt.label,
            orderIndex: opt.orderIndex,
          },
          select: voteOptionSelect,
        }),
      ),
    );
  }

  async deleteTopic(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string }> {
    return tx.voteTopic.delete({
      where: { id },
      select: { id: true },
    });
  }

  async findBallot(
    ctx: IContext,
    userId: string,
    topicId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaVoteBallot | null> {
    const query = (t: Prisma.TransactionClient) =>
      t.voteBallot.findUnique({
        where: { userId_topicId: { userId, topicId } },
        select: voteBallotSelect,
      });
    return tx ? query(tx) : ctx.issuer.public(ctx, query);
  }

  async upsertBallot(
    ctx: IContext,
    userId: string,
    input: GqlVoteCastInput,
    power: number,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaVoteBallot> {
    return tx.voteBallot.upsert({
      where: { userId_topicId: { userId, topicId: input.topicId } },
      update: {
        optionId: input.optionId,
        power,
      },
      create: {
        userId,
        topicId: input.topicId,
        optionId: input.optionId,
        power,
      },
      select: voteBallotSelect,
    });
  }

  async incrementOptionCount(
    ctx: IContext,
    optionId: string,
    power: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.voteOption.update({
      where: { id: optionId },
      data: {
        voteCount: { increment: 1 },
        totalPower: { increment: power },
      },
    });
  }

  async decrementOptionCount(
    ctx: IContext,
    optionId: string,
    power: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.voteOption.update({
      where: { id: optionId },
      data: {
        voteCount: { decrement: 1 },
        totalPower: { decrement: power },
      },
    });
  }

  // 同じ選択肢への再投票時に totalPower のみ差分更新（voteCount は変化なし）
  async adjustOptionTotalPower(
    ctx: IContext,
    optionId: string,
    delta: number,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    if (delta === 0) return;
    await tx.voteOption.update({
      where: { id: optionId },
      data: {
        totalPower: delta > 0 ? { increment: delta } : { decrement: -delta },
      },
    });
  }
}
