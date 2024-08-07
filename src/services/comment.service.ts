import { prismaClient } from "@/prisma/client";
import {
  GqlAddCommentToEventPayload,
  GqlDeleteCommentFromEventPayload,
  GqlEvent,
  GqlMutationAddCommentToEventArgs,
  GqlMutationDeleteCommentFromEventArgs,
  GqlMutationUpdateCommentOfEventArgs,
  GqlUpdateCommentOfEventPayload,
} from "@/types/graphql";

export default class CommentService {
  private static db = prismaClient;

  static async addCommentToEvent({
    content,
  }: GqlMutationAddCommentToEventArgs): Promise<GqlAddCommentToEventPayload> {
    const { userId, eventId, postedAt, ...properties } = content;

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

    return {
      comment: {
        ...comment,
        event: {
          ...comment.event,
          totalMinutes: comment.event?.stat?.totalMinutes ?? 0,
        } as GqlEvent,
      },
    };
  }

  static async updateCommentOfEvent({
    id,
    content,
  }: GqlMutationUpdateCommentOfEventArgs): Promise<GqlUpdateCommentOfEventPayload> {
    const comment = await this.db.comment.update({
      where: { id },
      data: content,
      include: {
        user: true,
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
      },
    });

    return {
      comment: {
        ...comment,
        event: {
          ...comment.event,
          totalMinutes: comment.event?.stat?.totalMinutes ?? 0,
        } as GqlEvent,
      },
    };
  }

  static async deleteCommentFromEvent({
    id,
  }: GqlMutationDeleteCommentFromEventArgs): Promise<GqlDeleteCommentFromEventPayload> {
    const comment = await this.db.comment.delete({
      where: { id },
      include: {
        user: true,
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
      },
    });

    return {
      comment: {
        ...comment,
        event: {
          ...comment.event,
          totalMinutes: comment.event?.stat?.totalMinutes ?? 0,
        } as GqlEvent,
      },
    };
  }
}
