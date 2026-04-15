// Vote domain DataLoaders
// 現時点では VoteOption の個別取得用ローダーを定義
// 集計カラム（voteCount / totalPower）は VoteOption テーブルに非正規化済みのため
// 追加の集計クエリは不要

import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";
import { voteOptionSelect, PrismaVoteOption } from "@/application/domain/vote/data/type";

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

export function createMyVoteBallotLoader(prisma: PrismaClient, userId: string) {
  return new DataLoader<string, { id: string; optionId: string; power: number; createdAt: Date; updatedAt: Date | null } | null>(
    async (topicIds) => {
      const ballots = await prisma.voteBallot.findMany({
        where: {
          userId,
          topicId: { in: [...topicIds] },
        },
        select: {
          id: true,
          topicId: true,
          optionId: true,
          power: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      const map = new Map(ballots.map((b) => [b.topicId, b]));
      return topicIds.map((id) => map.get(id) ?? null);
    },
  );
}
