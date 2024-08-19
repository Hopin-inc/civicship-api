import LikeService from "@/services/like.service";
import {
  GqlMutationAddLikeToEventArgs,
  GqlMutationRemoveLikeFromEventArgs,
} from "@/types/graphql";

const likeResolver = {
  Mutation: {
    addLikeToEvent: async (_: unknown, args: GqlMutationAddLikeToEventArgs) =>
      LikeService.addLikeToEvent(args),
    removeLikeFromEvent: async (
      _: unknown,
      args: GqlMutationRemoveLikeFromEventArgs,
    ) => LikeService.removeLikeFromEvent(args),
  },
};

export default likeResolver;
