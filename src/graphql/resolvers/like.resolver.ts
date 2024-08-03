import LikeService from "@/services/like.service";
import {
  GqlMutationAddLikeToEventArgs,
  GqlMutationRemoveLikeFromEventArgs,
} from "@/types/graphql";

const likeResolver = {
  Mutation: {
    addLike: async (_: unknown, args: GqlMutationAddLikeToEventArgs) =>
      LikeService.addLikeToEvent(args),
    removeLike: async (_: unknown, args: GqlMutationRemoveLikeFromEventArgs) =>
      LikeService.removeLikeFromEvent(args),
  },
};

export default likeResolver;
