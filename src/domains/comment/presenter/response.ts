import {
  GqlCommentAddEventPayload,
  GqlCommentDeletePayload,
  GqlCommentUpdateContentPayload,
} from "@/types/graphql";
import { CommentCreatePayloadWithArgs, CommentUpdatePayloadWithArgs } from "@/domains/comment/type";

export default class CommentResponseFormat {
  static createToEvent(comment: CommentCreatePayloadWithArgs): GqlCommentAddEventPayload {
    return {
      comment: {
        ...comment,
        event: comment.event,
        user: comment.user,
      },
    };
  }

  static update(comment: CommentUpdatePayloadWithArgs): GqlCommentUpdateContentPayload {
    return {
      comment: {
        ...comment,
        event: comment.event,
        user: comment.user,
      },
    };
  }

  static delete(commentId: string): GqlCommentDeletePayload {
    return {
      commentId,
    };
  }
}
