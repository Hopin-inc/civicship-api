import { prismaClient } from "@/prisma/client";
import {
  GqlAddLikeToEventPayload,
  GqlEvent,
  GqlMutationAddLikeToEventArgs,
  GqlMutationRemoveLikeFromEventArgs,
  GqlRemoveLikeFromEventPayload,
} from "@/types/graphql";

export default class LikeService {
  private static db = prismaClient;

  static async addLikeToEvent({
    content,
  }: GqlMutationAddLikeToEventArgs): Promise<GqlAddLikeToEventPayload> {
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
    if (!like.event) {
      throw new Error(`Like with ID ${like.id} has no corresponding event`);
    }

    return {
      like: {
        ...like,
        event: {
          ...like.event,
          totalMinutes: like.event?.stat?.totalMinutes ?? 0,
        },
      },
    };
  }

  static async removeLikeFromEvent({
    id,
  }: GqlMutationRemoveLikeFromEventArgs): Promise<GqlRemoveLikeFromEventPayload> {
    const like = await this.db.like.delete({
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
    if (!like.event) {
      throw new Error(`Like with ID ${like.id} has no corresponding event`);
    }

    return {
      like: {
        ...like,
        event: {
          ...like.event,
          totalMinutes: like.event?.stat?.totalMinutes ?? 0,
        },
      },
    };
  }
}
