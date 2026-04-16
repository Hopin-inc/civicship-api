import { injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { GqlVoteTopicCreateInput, GqlVoteTopicUpdateInput } from "@/types/graphql";

@injectable()
export default class VoteConverter {
  createTopic(input: GqlVoteTopicCreateInput, currentUserId: string): Prisma.VoteTopicCreateInput {
    return {
      title: input.title,
      description: input.description ?? null,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      community: { connect: { id: input.communityId } },
      createdByUser: { connect: { id: currentUserId } },
    };
  }

  updateTopic(input: GqlVoteTopicUpdateInput): Prisma.VoteTopicUpdateInput {
    return {
      title: input.title,
      description: input.description ?? null,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
    };
  }
}
