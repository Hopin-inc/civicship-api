import {
  GqlCommentAddEventPayload,
  GqlCommentDeletePayload,
  GqlCommentUpdateContentPayload,
  GqlMutationCommentAddEventArgs,
  GqlMutationCommentDeleteArgs,
  GqlMutationCommentUpdateContentArgs,
} from "@/types/graphql";
import CommentService from "@/domains/comment/service";
import CommentResponseFormat from "@/domains/comment/presenter/response";

export default class CommentUseCase {
  static async userAddCommentToEvent(
    args: GqlMutationCommentAddEventArgs,
  ): Promise<GqlCommentAddEventPayload> {
    const comment = await CommentService.commentAddEvent(args);
    return CommentResponseFormat.createToEvent(comment);
  }

  static async userUpdateContentOfComment(
    args: GqlMutationCommentUpdateContentArgs,
  ): Promise<GqlCommentUpdateContentPayload> {
    const comment = await CommentService.commentUpdate(args);
    return CommentResponseFormat.update(comment);
  }

  static async userDeleteComment(
    args: GqlMutationCommentDeleteArgs,
  ): Promise<GqlCommentDeletePayload> {
    const comment = await CommentService.commentDelete(args);
    return CommentResponseFormat.delete(comment.id);
  }
}
