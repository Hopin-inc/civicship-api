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

    const [like, event, user] = await Promise.all([
      this.db.like.create({ data }),
      this.db.event.findUnique({ where: { id: content.eventId } }),
      this.db.user.findUnique({ where: { id: content.userId } }),
    ]);

    if (!event || !user) {
      throw new Error("Event or user not found");
    }

    return {
      ...like,
      event,
      user,
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
        event: true,
      },
    });

    if (!like.user || !like.event) {
      throw new Error("User or event not found");
    }

    return {
      ...like,
      user: like.user,
      event: like.event,
    };
  }
}
