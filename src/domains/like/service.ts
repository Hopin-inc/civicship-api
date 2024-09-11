import { GqlMutationLikeAddEventArgs, GqlMutationLikeDeleteArgs } from "@/types/graphql";
import LikeInputFormat from "@/domains/like/presenter/input";
import LikeRepository from "@/domains/like/repository";

export default class LikeService {
  static async likeAddEvent({ input }: GqlMutationLikeAddEventArgs) {
    const data = LikeInputFormat.createToEvent({ input });

    const like = await LikeRepository.createToEvent(data);
    if (!like.event) {
      throw new Error(`Like with ID ${like.id} has no corresponding event`);
    } else if (!like.user) {
      throw new Error(`Like with ID ${like.id} has no corresponding user`);
    }
    return like;
  }

  static async likeDelete({ id }: GqlMutationLikeDeleteArgs) {
    return LikeRepository.delete(id);
  }
}
