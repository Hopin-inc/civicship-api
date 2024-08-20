import { prismaClient } from "@/prisma/client";
import {
  GqlLikeAddEventPayload,
  GqlEvent,
  GqlMutationLikeAddEventArgs,
  GqlMutationLikeDeleteArgs,
  GqlLikeDeletePayload,
} from "@/types/graphql";

export default class LikeService {
  private static db = prismaClient;

  static async likeAddEvent({
    input,
  }: GqlMutationLikeAddEventArgs): Promise<GqlLikeAddEventPayload> {
    const like = await this.db.like.create({
      data: {
        event: { connect: { id: input.eventId } },
        user: { connect: { id: input.userId } },
        postedAt: new Date(input.postedAt ?? Date.now()).toISOString(),
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
        } as GqlEvent,
      },
    };
  }

  static async likeDelete({
    id,
  }: GqlMutationLikeDeleteArgs): Promise<GqlLikeDeletePayload> {
    await this.db.like.delete({
      where: { id },
    });
    return { likeId: id };
  }
}
