import {
  GqlMutationCommentAddEventArgs,
  GqlMutationCommentDeleteArgs,
  GqlMutationCommentUpdateContentArgs,
} from "@/types/graphql";
import CommentInputFormat from "@/domains/comment/presenter/input";
import CommentRepository from "@/domains/comment/repository";

export default class CommentService {
  static async commentAddEvent({ input }: GqlMutationCommentAddEventArgs) {
    const data = CommentInputFormat.createToEvent({ input });

    const comment = await CommentRepository.createToEvent(data);
    if (!comment.event) {
      throw new Error(`Comment with ID ${comment.id} has no corresponding event`);
    } else if (!comment.user) {
      throw new Error(`Comment with ID ${comment.id} has no corresponding user`);
    }

    return comment;
  }

  static async commentUpdate({ id, input }: GqlMutationCommentUpdateContentArgs) {
    const comment = await CommentRepository.update(id, input);
    if (!comment.event) {
      throw new Error(`Comment with ID ${comment.id} has no corresponding event`);
    } else if (!comment.user) {
      throw new Error(`Comment with ID ${comment.id} has no corresponding user`);
    }

    return comment;
  }

  static async commentDelete({ id }: GqlMutationCommentDeleteArgs) {
    return CommentRepository.delete(id);
  }
}
