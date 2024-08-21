import CommentService from "@/services/comment.service";
import {
  GqlMutationCommentAddEventArgs,
  GqlMutationCommentUpdateArgs,
  GqlMutationCommentDeleteArgs,
} from "@/types/graphql";

const commentResolver = {
  Mutation: {
    commentAddEvent: async (_: unknown, args: GqlMutationCommentAddEventArgs) =>
      CommentService.commentAddEvent(args),
    commentUpdate: async (_: unknown, args: GqlMutationCommentUpdateArgs) =>
      CommentService.commentUpdate(args),
    commentDelete: async (_: unknown, args: GqlMutationCommentDeleteArgs) =>
      CommentService.commentDelete(args),
  },
};

export default commentResolver;
