import { GqlLikeAddEventPayload, GqlLikeDeletePayload } from "@/types/graphql";
import { LikeCreatePayloadWithArgs } from "@/domains/like/type";

export default class LikeResponseFormat {
  static createToEvent(like: LikeCreatePayloadWithArgs): GqlLikeAddEventPayload {
    return {
      like: {
        ...like,
        event: like.event,
        user: like.user,
      },
    };
  }

  static delete(likeId: string): GqlLikeDeletePayload {
    return {
      likeId,
    };
  }
}
