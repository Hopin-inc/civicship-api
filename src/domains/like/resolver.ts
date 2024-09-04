import { GqlMutationLikeAddEventArgs, GqlMutationLikeDeleteArgs } from "@/types/graphql";
import LikeUseCase from "@/domains/like/like.usecase";

const likeResolver = {
  Mutation: {
    likeAddEvent: async (_: unknown, args: GqlMutationLikeAddEventArgs) =>
      LikeUseCase.userAddLikeToEvent(args),
    likeDelete: async (_: unknown, args: GqlMutationLikeDeleteArgs) =>
      LikeUseCase.userDeleteLike(args),
  },
};

export default likeResolver;
