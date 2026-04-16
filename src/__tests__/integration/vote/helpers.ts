import { NftInstanceStatus, NftWalletType } from "@prisma/client";
import { prismaClient } from "@/infrastructure/prisma/client";

let nftAddressCounter = 0;

/**
 * VoteTopic を gate/policy/options ごと DB に直接作成する。
 * startsAt/endsAt を自由に制御したいケース（過去日や特定フェーズ）に使用。
 * validateTopicInput を通さないため、業務バリデーション外の日付も設定可能。
 */
export async function createVoteTopic(params: {
  communityId: string;
  createdBy: string;
  startsAt: Date;
  endsAt: Date;
  gate?: {
    type?: "MEMBERSHIP" | "NFT";
    requiredRole?: string | null;
    nftTokenId?: string | null;
  };
  policy?: {
    type?: "FLAT" | "NFT_COUNT";
    nftTokenId?: string | null;
  };
}) {
  const gate = params.gate ?? {};
  const policy = params.policy ?? {};

  const topic = await prismaClient.voteTopic.create({
    data: {
      communityId: params.communityId,
      createdBy: params.createdBy,
      title: "Integration Test Vote",
      startsAt: params.startsAt,
      endsAt: params.endsAt,
    },
  });

  await prismaClient.voteGate.create({
    data: {
      type: gate.type ?? "MEMBERSHIP",
      topicId: topic.id,
      requiredRole: (gate.requiredRole as any) ?? null,
      nftTokenId: gate.nftTokenId ?? null,
    },
  });

  await prismaClient.votePowerPolicy.create({
    data: {
      type: policy.type ?? "FLAT",
      topicId: topic.id,
      nftTokenId: policy.nftTokenId ?? null,
    },
  });

  const optionA = await prismaClient.voteOption.create({
    data: { topicId: topic.id, label: "Option A", orderIndex: 0 },
  });
  const optionB = await prismaClient.voteOption.create({
    data: { topicId: topic.id, label: "Option B", orderIndex: 1 },
  });

  return { topic, optionA, optionB };
}

/**
 * NftToken + NftWallet（ユーザー所有） + NftInstance（OWNED）を作成する。
 * NFT gate / NFT_COUNT policy のテストで使用。
 */
export async function createOwnedNft(userId: string) {
  nftAddressCounter += 1;
  const address = `test-nft-${Date.now()}-${nftAddressCounter}`;

  const nftToken = await prismaClient.nftToken.create({
    data: { address, type: "GOVERNANCE" },
  });

  const nftWallet = await prismaClient.nftWallet.create({
    data: { userId, type: NftWalletType.INTERNAL, walletAddress: `wallet-${nftAddressCounter}` },
  });

  const nftInstance = await prismaClient.nftInstance.create({
    data: {
      instanceId: `instance-${nftAddressCounter}`,
      nftTokenId: nftToken.id,
      nftWalletId: nftWallet.id,
      status: NftInstanceStatus.OWNED,
    },
  });

  return { nftToken, nftWallet, nftInstance };
}

/**
 * NftToken のみ作成する（NFT_COUNT policy で power=0 を再現するために使用）。
 * ユーザーに NftInstance は与えない。
 */
export async function createNftToken() {
  nftAddressCounter += 1;
  const address = `test-nft-empty-${Date.now()}-${nftAddressCounter}`;
  return prismaClient.nftToken.create({
    data: { address, type: "GOVERNANCE" },
  });
}
