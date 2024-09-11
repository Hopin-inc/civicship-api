import { Prisma } from "@prisma/client";
import { GqlMutationLikeAddEventArgs } from "@/types/graphql";

export default class LikeInputFormat {
  static createToEvent({ input }: GqlMutationLikeAddEventArgs): Prisma.LikeCreateInput {
    return {
      event: { connect: { id: input.eventId } },
      user: { connect: { id: input.userId } },
      postedAt: new Date(input.postedAt ?? Date.now()).toISOString(),
    };
  }
}
