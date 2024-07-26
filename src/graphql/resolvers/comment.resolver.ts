import CommentService from "@/services/comment.service";
import {
  GqlMutationCreateCommentArgs,
  GqlMutationUpdateCommentArgs,
  GqlMutationDeleteCommentArgs,
} from "@/types/graphql";

const commentResolver = {
  // Query: {
  // },
  Mutation: {
    createComment: async (_: unknown, args: GqlMutationCreateCommentArgs) =>
      CommentService.createComment(args),
    updateComment: async (_: unknown, args: GqlMutationUpdateCommentArgs) =>
      CommentService.updateComment(args),
    deleteComment: async (_: unknown, args: GqlMutationDeleteCommentArgs) =>
      CommentService.deleteComment(args),
  },
};

export default commentResolver;
