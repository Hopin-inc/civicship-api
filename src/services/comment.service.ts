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

    return this.db.comment.create({
      data,
      include: {
        user: true,
        event: true,
      },
    });
  }

  static async updateComment({
    id,
    content,
  }: GqlMutationUpdateCommentArgs): Promise<GqlComment> {
    return this.db.comment.update({
      where: { id },
      data: content,
      include: {
        user: true,
        event: true,
      },
    });
  }

  static async deleteComment({
    id,
  }: GqlMutationDeleteCommentArgs): Promise<GqlComment> {
    return this.db.comment.delete({
      where: { id },
      include: {
        user: true,
        event: true,
      },
    });
  }
}
