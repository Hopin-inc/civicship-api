import { PrismaClient } from "@prisma/client";
import DataLoader from "dataloader";
import { voteOptionSelect, voteBallotSelect, PrismaVoteOption, PrismaVoteBallot } from "@/application/domain/vote/data/type";

// VoteOption を id でバッチロード（VoteBallot.option フィールドリゾルバー用）
export function createVoteOptionLoader(prisma: PrismaClient) {
  return new DataLoader<string, PrismaVoteOption | null>(async (optionIds) => {
    const options = await prisma.voteOption.findMany({
      where: { id: { in: [...optionIds] } },
      select: voteOptionSelect,
    });
    const map = new Map(options.map((o) => [o.id, o]));
    return optionIds.map((id) => map.get(id) ?? null);
  });
}

// VoteBallot を { userId, topicId } でバッチロード（VoteTopic.myBallot フィールドリゾルバー用）
// 1リクエスト内で複数 VoteTopic を表示する場合でも、全投票をまとめて1クエリで取得する
export function createMyVoteBallotLoader(prisma: PrismaClient) {
  return new DataLoader<{ userId: string; topicId: string }, PrismaVoteBallot | null, string>(
    async (keys) => {
      const ballots = await prisma.voteBallot.findMany({
        where: { OR: keys.map((k) => ({ userId: k.userId, topicId: k.topicId })) },
        select: voteBallotSelect,
      });
      return keys.map(
        (k) => ballots.find((b) => b.userId === k.userId && b.topicId === k.topicId) ?? null,
      );
    },
    { cacheKeyFn: (k) => `${k.userId}:${k.topicId}` },
  );
}

// NftToken を id でバッチロード（VoteGate / VotePowerPolicy の nftToken フィールドリゾルバー用）
// GQL NftToken 型の必須フィールド（createdAt: Datetime!）を含む完全な select を使用
export function createNftTokenLoader(prisma: PrismaClient) {
  return new DataLoader<
    string,
    {
      id: string;
      address: string;
      name: string | null;
      symbol: string | null;
      type: string;
      json: unknown;
      createdAt: Date;
      updatedAt: Date | null;
    } | null
  >(
    async (tokenIds) => {
      const tokens = await prisma.nftToken.findMany({
        where: { id: { in: [...tokenIds] } },
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
      });
      const map = new Map(tokens.map((t) => [t.id, t]));
      return tokenIds.map((id) => map.get(id) ?? null);
    },
  );
}
