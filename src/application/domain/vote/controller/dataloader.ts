import { PrismaClient } from "@prisma/client";
import {
  voteOptionSelect,
  voteBallotSelect,
  PrismaVoteOption,
  PrismaVoteBallot,
} from "@/application/domain/vote/data/type";
import { nftTokenSelect } from "@/application/domain/account/nft-token/data/type";
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
// NftToken ドメインの nftTokenSelect を共有することで、GQL NftToken 型の全フィールド
// （`community` 解決に必要な `communityId` を含む）を漏れなく取得する。
// select を独自定義すると NftToken ドメインのフィールド追加に追従漏れが発生するリスクがある。
export function createNftTokenLoader(prisma: PrismaClient) {
  return createLoaderById(
    async (ids) =>
      prisma.nftToken.findMany({
        where: { id: { in: [...ids] } },
        select: nftTokenSelect,
      }),
    (record) => record,
  );
}
