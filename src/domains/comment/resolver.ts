import {
  GqlMutationCommentAddEventArgs,
  GqlMutationCommentUpdateContentArgs,
  GqlMutationCommentDeleteArgs,
} from "@/types/graphql";
import CommentUseCase from "@/domains/comment/comment.usecase";

const commentResolver = {
  Mutation: {
    commentAddEvent: async (_: unknown, args: GqlMutationCommentAddEventArgs) =>
      CommentUseCase.userAddCommentToEvent(args),
    commentUpdateContent: async (_: unknown, args: GqlMutationCommentUpdateContentArgs) =>
      CommentUseCase.userUpdateContentOfComment(args),
    commentDelete: async (_: unknown, args: GqlMutationCommentDeleteArgs) =>
      CommentUseCase.userDeleteComment(args),
  },
};

export default commentResolver;
