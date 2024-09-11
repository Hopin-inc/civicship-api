import {
  GqlLikeAddEventPayload,
  GqlMutationLikeAddEventArgs,
  GqlMutationLikeDeleteArgs,
  GqlLikeDeletePayload,
} from "@/types/graphql";
import LikeService from "@/domains/like/service";
import LikeResponseFormat from "@/domains/like/presenter/response";

export default class LikeUseCase {
  static async userAddLikeToEvent(
    args: GqlMutationLikeAddEventArgs,
  ): Promise<GqlLikeAddEventPayload> {
    const like = await LikeService.likeAddEvent(args);
    return LikeResponseFormat.createToEvent(like);
  }

  static async userDeleteLike(args: GqlMutationLikeDeleteArgs): Promise<GqlLikeDeletePayload> {
    const like = await LikeService.likeDelete(args);
    return LikeResponseFormat.delete(like.id);
  }
}
