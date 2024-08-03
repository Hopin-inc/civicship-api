import CommentService from "@/services/comment.service";
import {
  GqlMutationAddCommentToEventArgs,
  GqlMutationUpdateCommentOfEventArgs,
  GqlMutationDeleteCommentFromEventArgs,
} from "@/types/graphql";

const commentResolver = {
  Mutation: {
    addCommentToEvent: async (
      _: unknown,
      args: GqlMutationAddCommentToEventArgs,
    ) => CommentService.addCommentToEvent(args),
    updateCommentOfEvent: async (
      _: unknown,
      args: GqlMutationUpdateCommentOfEventArgs,
    ) => CommentService.updateCommentOfEvent(args),
    deleteCommentFromEvent: async (
      _: unknown,
      args: GqlMutationDeleteCommentFromEventArgs,
    ) => CommentService.deleteCommentFromEvent(args),
  },
};

export default commentResolver;
