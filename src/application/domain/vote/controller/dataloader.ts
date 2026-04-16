import { PrismaClient } from "@prisma/client";
import {
  voteOptionSelect,
  voteBallotSelect,
  PrismaVoteOption,
  PrismaVoteBallot,
} from "@/application/domain/vote/data/type";
import {
  createLoaderById,
  createLoaderByCompositeKey,
} from "@/presentation/graphql/dataloader/utils";

// VoteOption を id でバッチロード（VoteBallot.option フィールドリゾルバー用）
export function createVoteOptionLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaVoteOption, PrismaVoteOption>(
    async (ids) =>
      prisma.voteOption.findMany({
        where: { id: { in: [...ids] } },
        select: voteOptionSelect,
      }),
    (record) => record,
  );
}

// VoteBallot を { userId, topicId } でバッチロード（VoteTopic.myBallot フィールドリゾルバー用）
// 1リクエスト内で複数 VoteTopic を表示する場合でも、全投票をまとめて1クエリで取得する
export function createMyVoteBallotLoader(prisma: PrismaClient) {
  return createLoaderByCompositeKey<
    { userId: string; topicId: string },
    PrismaVoteBallot,
    PrismaVoteBallot
  >(
    async (keys) =>
      prisma.voteBallot.findMany({
        where: { OR: keys.map((k) => ({ userId: k.userId, topicId: k.topicId })) },
        select: voteBallotSelect,
      }),
    (record) => ({ userId: record.userId, topicId: record.topicId }),
    (record) => record,
  );
}

// NftToken を id でバッチロード（VoteGate / VotePowerPolicy の nftToken フィールドリゾルバー用）
// GQL NftToken 型の必須フィールド（createdAt: Datetime!）を含む完全な select を使用
export function createNftTokenLoader(prisma: PrismaClient) {
  return createLoaderById(
    async (ids) =>
      prisma.nftToken.findMany({
        where: { id: { in: [...ids] } },
        select: {
          id: true,
          address: true,
          name: true,
          symbol: true,
          type: true,
          json: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    (record) => record,
  );
}
