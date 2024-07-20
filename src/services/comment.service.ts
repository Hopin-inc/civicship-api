import { prismaClient } from "@/prisma/client";
import {
  GqlComment,
  GqlMutationCreateCommentArgs,
  GqlMutationDeleteCommentArgs,
  GqlMutationUpdateCommentArgs,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class CommentService {
  private static db = prismaClient;

  static async createComment({
    content,
  }: GqlMutationCreateCommentArgs): Promise<GqlComment> {
    const { userId, eventId, postedAt, ...properties } = content;

    const data: Prisma.CommentCreateInput = {
      ...properties,
      user: {
        connect: { id: userId },
      },
      event: {
        connect: { id: eventId },
      },
      postedAt: new Date(postedAt ?? Date.now()).toISOString(),
    };

    const [comment, event, user] = await Promise.all([
      this.db.comment.create({ data }),
      this.db.event.findUnique({ where: { id: eventId } }),
      this.db.user.findUnique({ where: { id: userId } }),
    ]);

    if (!event || !user) {
      throw new Error("Event or user not found");
    }

    return {
      ...comment,
      event,
      user,
    };
  }

  static async updateComment({
    id,
    content,
  }: GqlMutationUpdateCommentArgs): Promise<GqlComment> {
    const comment = await this.db.comment.update({
      where: { id },
      data: content,
    });

    const [event, user] = await Promise.all([
      this.db.event.findUnique({ where: { id: comment.eventId } }),
      this.db.user.findUnique({ where: { id: comment.userId } }),
    ]);

    if (!event || !user) {
      throw new Error("User or event not found");
    }

    return {
      ...comment,
      user: user,
      event: event,
    };
  }

  static async deleteComment({
    id,
  }: GqlMutationDeleteCommentArgs): Promise<GqlComment> {
    const comment = await this.db.comment.delete({
      where: { id },
      include: {
        user: true,
        event: true,
      },
    });

    if (!comment.user || !comment.event) {
      throw new Error("User or event not found");
    }

    return {
      ...comment,
      user: comment.user,
      event: comment.event,
    };
  }
}
