import {
  GqlMutationApplicationAddConfirmationArgs,
  GqlMutationApplicationApprovalArgs,
  GqlMutationApplicationCreateArgs,
  GqlMutationApplicationDeleteArgs,
  GqlMutationApplicationDeleteConfirmationArgs,
  GqlMutationApplicationPublishArgs,
  GqlMutationApplicationRefusalArgs,
  GqlMutationApplicationUnpublishArgs,
  GqlMutationApplicationUpdateCommentArgs,
  GqlMutationApplicationUpdateConfirmationCommentArgs,
  GqlQueryApplicationArgs,
  GqlQueryApplicationsArgs,
} from "@/types/graphql";
import ApplicationInputFormat from "@/domains/application/presenter/input";
import ApplicationRepository from "@/domains/application/repository";

export default class ApplicationService {
  static async queryApplications({ filter, sort, cursor }: GqlQueryApplicationsArgs, take: number) {
    const where = ApplicationInputFormat.filter({ filter });
    const orderBy = ApplicationInputFormat.sort({ sort });

    return ApplicationRepository.query(where, orderBy, take, cursor);
  }

  static async getApplication({ id }: GqlQueryApplicationArgs) {
    return ApplicationRepository.find(id);
  }

  static async applicationCreate({ input }: GqlMutationApplicationCreateArgs) {
    const data = ApplicationInputFormat.create({ input });
    const application = await ApplicationRepository.create(data);

    if (!application.event) {
      throw new Error("Event cannot be null");
    }
    if (!application.user) {
      throw new Error("User cannot be null");
    }

    return application;
  }

  static async applicationDelete({ id }: GqlMutationApplicationDeleteArgs) {
    return ApplicationRepository.delete(id);
  }

  static async applicationUpdateComment({ id, input }: GqlMutationApplicationUpdateCommentArgs) {
    const application = await ApplicationRepository.updateContent(id, input);

    if (!application.event) {
      throw new Error("Event cannot be null");
    }
    if (!application.user) {
      throw new Error("User cannot be null");
    }

    return application;
  }

  static async applicationPublish({ id }: GqlMutationApplicationPublishArgs) {
    return await ApplicationRepository.switchPrivacy(id, true);
  }

  static async applicationUnpublish({ id }: GqlMutationApplicationUnpublishArgs) {
    return await ApplicationRepository.switchPrivacy(id, false);
  }

  static async applicationUpdateConfirmation({
    id,
    input,
  }: GqlMutationApplicationAddConfirmationArgs) {
    const data = ApplicationInputFormat.addConfirmation({ id, input });
    return ApplicationRepository.updateConfirmation(id, data);
  }

  static async applicationApprove({ id, input }: GqlMutationApplicationApprovalArgs) {
    return ApplicationRepository.switchIsApproved(id, input.applicationConfirmationId, true);
  }

  static async applicationRefuse({ id, input }: GqlMutationApplicationRefusalArgs) {
    return ApplicationRepository.switchIsApproved(id, input.applicationConfirmationId, false);
  }

  static async applicationUpdateConfirmationComment({
    id,
    input,
  }: GqlMutationApplicationUpdateConfirmationCommentArgs) {
    return ApplicationRepository.updateConfirmationComment(
      id,
      input.applicationConfirmationId,
      input.comment,
    );
  }

  static async applicationDeleteConfirmation({
    id,
    input,
  }: GqlMutationApplicationDeleteConfirmationArgs) {
    return ApplicationRepository.deleteConfirmation(id, input.applicationConfirmationId);
  }
}
