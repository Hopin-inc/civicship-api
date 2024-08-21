import CommentService from "@/services/comment.service";
import {
  GqlMutationCommentAddEventArgs,
  GqlMutationCommentUpdateContentArgs,
  GqlMutationCommentDeleteArgs,
} from "@/types/graphql";

const commentResolver = {
  Mutation: {
    commentAddEvent: async (_: unknown, args: GqlMutationCommentAddEventArgs) =>
      CommentService.commentAddEvent(args),
    commentUpdateContent: async (_: unknown, args: GqlMutationCommentUpdateContentArgs) =>
      CommentService.commentUpdate(args),
    commentDelete: async (_: unknown, args: GqlMutationCommentDeleteArgs) =>
      CommentService.commentDelete(args),
  },
};

export default commentResolver;
