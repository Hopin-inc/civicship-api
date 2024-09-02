import { Prisma } from "@prisma/client";
import { GqlMutationCommentAddEventArgs } from "@/types/graphql";

export default class CommentInputFormat {
  static createToEvent({ input }: GqlMutationCommentAddEventArgs): Prisma.CommentCreateInput {
    const { userId, eventId, postedAt, ...properties } = input;

    return {
      ...properties,
      user: { connect: { id: userId } },
      event: { connect: { id: eventId } },
      postedAt: new Date(postedAt ?? Date.now()).toISOString(),
    };
  }
}
