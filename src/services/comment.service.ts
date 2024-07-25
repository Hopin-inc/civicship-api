import { prismaClient } from "@/prisma/client";
import {
  GqlComment,
  GqlMutationCreateCommentArgs,
  GqlMutationDeleteCommentArgs,
  GqlMutationUpdateCommentArgs,
} from "@/types/graphql";

export default class CommentService {
  private static db = prismaClient;

  static async createComment({
    content,
  }: GqlMutationCreateCommentArgs): Promise<GqlComment> {
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
      ...comment,
      event: {
        ...comment.event,
        totalMinutes: comment.event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async updateComment({
    id,
    content,
  }: GqlMutationUpdateCommentArgs): Promise<GqlComment> {
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
      ...comment,
      event: {
        ...comment.event,
        totalMinutes: comment.event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async deleteComment({
    id,
  }: GqlMutationDeleteCommentArgs): Promise<GqlComment> {
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
      ...comment,
      event: {
        ...comment.event,
        totalMinutes: comment.event.stat?.totalMinutes ?? 0,
      },
    };
  }
}
