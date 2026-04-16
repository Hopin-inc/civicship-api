import { PrismaClient } from "@prisma/client";
import {
  createVoteOptionLoader,
  createNftTokenLoader,
  createMyVoteBallotLoader,
} from "@/application/domain/vote/controller/dataloader";

export function createVoteLoaders(prisma: PrismaClient) {
  return {
    voteOption: createVoteOptionLoader(prisma),
    nftToken: createNftTokenLoader(prisma),
    myVoteBallot: createMyVoteBallotLoader(prisma),
  };
}
