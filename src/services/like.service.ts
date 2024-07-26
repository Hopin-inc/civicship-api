import { prismaClient } from "@/prisma/client";
import {
  GqlLike,
  GqlMutationAddLikeArgs,
  GqlMutationRemoveLikeArgs,
} from "@/types/graphql";

export default class LikeService {
  private static db = prismaClient;

  static async addLike({ content }: GqlMutationAddLikeArgs): Promise<GqlLike> {
    const like = await this.db.like.create({
      data: {
        event: { connect: { id: content.eventId } },
        user: { connect: { id: content.userId } },
        postedAt: new Date(content.postedAt ?? Date.now()).toISOString(),
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
      ...like,
      event: {
        ...like.event,
        totalMinutes: like.event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async removeLike({
    eventId,
    userId,
  }: GqlMutationRemoveLikeArgs): Promise<GqlLike> {
    const like = await this.db.like.delete({
      where: {
        userId_eventId: {
          eventId,
          userId,
        },
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
      ...like,
      event: {
        ...like.event,
        totalMinutes: like.event.stat?.totalMinutes ?? 0,
      },
    };
  }
}
