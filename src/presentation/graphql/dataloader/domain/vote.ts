import { PrismaClient } from "@prisma/client";
import DataLoader from "dataloader";
import { voteOptionSelect, PrismaVoteOption } from "@/application/domain/vote/data/type";

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

// NftToken を id でバッチロード（VoteGate / VotePowerPolicy の nftToken フィールドリゾルバー用）
export function createNftTokenLoader(prisma: PrismaClient) {
  return new DataLoader<string, { id: string; address: string; name: string | null; symbol: string | null; type: string } | null>(
    async (tokenIds) => {
      const tokens = await prisma.nftToken.findMany({
        where: { id: { in: [...tokenIds] } },
        select: { id: true, address: true, name: true, symbol: true, type: true },
      });
      const map = new Map(tokens.map((t) => [t.id, t]));
      return tokenIds.map((id) => map.get(id) ?? null);
    },
  );
}

export function createVoteLoaders(prisma: PrismaClient) {
  return {
    voteOption: createVoteOptionLoader(prisma),
    nftToken: createNftTokenLoader(prisma),
  };
}
