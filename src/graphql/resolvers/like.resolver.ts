import LikeService from "@/services/like.service";
import {
  GqlMutationLikeAddEventArgs,
  GqlMutationLikeDeleteArgs,
} from "@/types/graphql";

const likeResolver = {
  Mutation: {
    likeAddEvent: async (_: unknown, args: GqlMutationLikeAddEventArgs) =>
      LikeService.likeAddEvent(args),
    likeDelete: async (_: unknown, args: GqlMutationLikeDeleteArgs) =>
      LikeService.likeDelete(args),
  },
};

export default likeResolver;
