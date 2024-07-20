import LikeService from "@/services/like.service";
import {
  GqlMutationAddLikeArgs,
  GqlMutationRemoveLikeArgs,
} from "@/types/graphql";

const likeResolver = {
  Mutation: {
    addLike: async (_: unknown, args: GqlMutationAddLikeArgs) =>
      LikeService.addLike(args),
    removeLike: async (_: unknown, args: GqlMutationRemoveLikeArgs) =>
      LikeService.removeLike(args),
  },
};

export default likeResolver;