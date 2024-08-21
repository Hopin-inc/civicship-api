import { prismaClient } from "@/prisma/client";
import {
  GqlCommentAddEventPayload,
  GqlCommentDeletePayload,
  GqlMutationCommentAddEventArgs,
  GqlMutationCommentDeleteArgs,
  GqlMutationCommentUpdateArgs,
  GqlCommentUpdatePayload,
} from "@/types/graphql";

export default class CommentService {
  private static db = prismaClient;

  static async commentAddEvent({
    input,
  }: GqlMutationCommentAddEventArgs): Promise<GqlCommentAddEventPayload> {
    const { userId, eventId, postedAt, ...properties } = input;

    const comment = await this.db.comment.create({
      data: {
        ...properties,
        user: { connect: { id: userId } },
        event: { connect: { id: eventId } },
        postedAt: new Date(postedAt ?? Date.now()).toISOString(),
      },
      include: {
        user: true,
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
      },
    });
    if (!comment.event) {
      throw new Error(`Comment with ID ${comment.id} has no corresponding event`);
    } else if (!comment.user) {
      throw new Error(`Comment with ID ${comment.id} has no corresponding user`);
    }

    return {
      comment: {
        ...comment,
        event: {
          ...comment.event,
          totalMinutes: comment.event?.stat?.totalMinutes ?? 0,
        },
        user: comment.user,
      },
    };
  }

  static async commentUpdate({
    id,
    input,
  }: GqlMutationCommentUpdateArgs): Promise<GqlCommentUpdatePayload> {
    const comment = await this.db.comment.update({
      where: { id },
      data: input,
      include: {
        user: true,
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
      },
    });
    if (!comment.event) {
      throw new Error(`Comment with ID ${comment.id} has no corresponding event`);
    } else if (!comment.user) {
      throw new Error(`Comment with ID ${comment.id} has no corresponding user`);
    }

    return {
      comment: {
        ...comment,
        event: {
          ...comment.event,
          totalMinutes: comment.event?.stat?.totalMinutes ?? 0,
        },
        user: comment.user,
      },
    };
  }

  static async commentDelete({
    id,
  }: GqlMutationCommentDeleteArgs): Promise<GqlCommentDeletePayload> {
    await this.db.comment.delete({
      where: { id },
    });

    return { commentId: id };
  }
}
