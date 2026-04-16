import { Prisma } from "@prisma/client";

export const voteTopicSelect = Prisma.validator<Prisma.VoteTopicSelect>()({
  id: true,
  communityId: true,
  createdBy: true,
  title: true,
  description: true,
  startsAt: true,
  endsAt: true,
  createdAt: true,
  updatedAt: true,
});

export const voteGateSelect = Prisma.validator<Prisma.VoteGateSelect>()({
  id: true,
  type: true,
  nftTokenId: true,
  requiredRole: true,
  topicId: true,
});

export const votePowerPolicySelect = Prisma.validator<Prisma.VotePowerPolicySelect>()({
  id: true,
  type: true,
  nftTokenId: true,
  topicId: true,
});

export const voteOptionSelect = Prisma.validator<Prisma.VoteOptionSelect>()({
  id: true,
  topicId: true,
  label: true,
  orderIndex: true,
  voteCount: true,
  totalPower: true,
});

export const voteBallotSelect = Prisma.validator<Prisma.VoteBallotSelect>()({
  id: true,
  userId: true,
  topicId: true,
  optionId: true,
  power: true,
  createdAt: true,
  updatedAt: true,
});

export const voteTopicWithRelationsSelect = Prisma.validator<Prisma.VoteTopicSelect>()({
  ...voteTopicSelect,
  gate: { select: voteGateSelect },
  powerPolicy: { select: votePowerPolicySelect },
  options: {
    select: voteOptionSelect,
    orderBy: { orderIndex: "asc" },
  },
});

export type PrismaVoteTopicBase = Prisma.VoteTopicGetPayload<{
  select: typeof voteTopicSelect;
}>;

export type PrismaVoteGate = Prisma.VoteGateGetPayload<{
  select: typeof voteGateSelect;
}>;

export type PrismaVotePowerPolicy = Prisma.VotePowerPolicyGetPayload<{
  select: typeof votePowerPolicySelect;
}>;

export type PrismaVoteOption = Prisma.VoteOptionGetPayload<{
  select: typeof voteOptionSelect;
}>;

export type PrismaVoteBallot = Prisma.VoteBallotGetPayload<{
  select: typeof voteBallotSelect;
}>;

export type PrismaVoteTopic = Prisma.VoteTopicGetPayload<{
  select: typeof voteTopicWithRelationsSelect;
}>;
