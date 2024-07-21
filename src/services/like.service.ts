import { prismaClient } from "@/prisma/client";
import {
  GqlLike,
  GqlMutationAddLikeArgs,
  GqlMutationRemoveLikeArgs,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class LikeService {
  private static db = prismaClient;

  static async addLike({ content }: GqlMutationAddLikeArgs): Promise<GqlLike> {
    const data: Prisma.LikeCreateInput = {
      event: {
        connect: { id: content.eventId },
      },
      user: {
        connect: { id: content.userId },
      },
      postedAt: new Date(content.postedAt ?? Date.now()).toISOString(),
    };

    return this.db.like.create({
      data,
      include: {
        user: true,
        event: true,
      },
    });
  }

  static async removeLike({
    eventId,
    userId,
  }: GqlMutationRemoveLikeArgs): Promise<GqlLike> {
    return this.db.like.delete({
      where: {
        userId_eventId: {
          eventId,
          userId,
        },
      },
      include: {
        user: true,
        event: true,
      },
    });
  }
}
