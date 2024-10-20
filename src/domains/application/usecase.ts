import {
  GqlQueryApplicationsArgs,
  GqlQueryApplicationArgs,
  GqlMutationApplicationCreateArgs,
  GqlMutationApplicationDeleteArgs,
  GqlMutationApplicationUpdateCommentArgs,
  GqlMutationApplicationPublishArgs,
  GqlMutationApplicationUnpublishArgs,
  GqlApplicationCreatePayload,
  GqlApplicationDeletePayload,
  GqlApplicationUpdateCommentPayload,
  GqlApplicationSwitchPrivacyPayload,
  GqlApplicationsConnection,
  GqlApplication,
  GqlMutationApplicationAddConfirmationArgs,
  GqlMutationApplicationUpdateConfirmationCommentArgs,
  GqlMutationApplicationDeleteConfirmationArgs,
  GqlApplicationAddConfirmationPayload,
  GqlApplicationSwitchIsApprovedPayload,
  GqlApplicationUpdateConfirmationCommentPayload,
  GqlApplicationDeleteConfirmationPayload,
  GqlMutationApplicationApproveArgs,
  GqlMutationApplicationRefuseArgs,
} from "@/types/graphql";
import ApplicationService from "@/domains/application/service";
import ApplicationResponseFormat from "@/domains/application/presenter/response";

export default class ApplicationUseCase {
  static async userGetManyPublicApplications({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryApplicationsArgs): Promise<GqlApplicationsConnection> {
    const take = first ?? 10;
    const data = await ApplicationService.queryApplications({ cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const applications: GqlApplication[] = data.slice(0, take).map((record) => {
      return ApplicationResponseFormat.get(record);
    });
    return ApplicationResponseFormat.query(applications, hasNextPage);
  }

  static async userGetApplication({ id }: GqlQueryApplicationArgs): Promise<GqlApplication | null> {
    const application = await ApplicationService.getApplication({ id });
    if (!application) {
      return null;
    }
    return ApplicationResponseFormat.get(application);
  }

  static async userCreateApplication({
    input,
  }: GqlMutationApplicationCreateArgs): Promise<GqlApplicationCreatePayload> {
    const application = await ApplicationService.applicationCreate({ input });
    return ApplicationResponseFormat.create(application);
  }

  static async userDeleteApplication({
    id,
  }: GqlMutationApplicationDeleteArgs): Promise<GqlApplicationDeletePayload> {
    await ApplicationService.applicationDelete({ id });
    return ApplicationResponseFormat.delete(id);
  }

  static async userUpdateApplicationComment({
    id,
    input,
  }: GqlMutationApplicationUpdateCommentArgs): Promise<GqlApplicationUpdateCommentPayload> {
    const application = await ApplicationService.applicationUpdateComment({ id, input });
    return ApplicationResponseFormat.updateContent(application);
  }

  static async userPublishApplication({
    id,
  }: GqlMutationApplicationPublishArgs): Promise<GqlApplicationSwitchPrivacyPayload> {
    const application = await ApplicationService.applicationPublish({ id });
    return ApplicationResponseFormat.switchPrivacy(application);
  }

  static async userUnpublishApplication({
    id,
  }: GqlMutationApplicationUnpublishArgs): Promise<GqlApplicationSwitchPrivacyPayload> {
    const application = await ApplicationService.applicationUnpublish({ id });
    return ApplicationResponseFormat.switchPrivacy(application);
  }

  static async userUpdateApplicationConfirmation({
    id,
    input,
  }: GqlMutationApplicationAddConfirmationArgs): Promise<GqlApplicationAddConfirmationPayload> {
    const application = await ApplicationService.applicationUpdateConfirmation({ id, input });
    return ApplicationResponseFormat.addConfirmation(application);
  }

  static async userApproveApplication({
    id,
    input,
  }: GqlMutationApplicationApproveArgs): Promise<GqlApplicationSwitchIsApprovedPayload> {
    const result = await ApplicationService.applicationApprove({ id, input });
    return ApplicationResponseFormat.switchIsApproved(result);
  }

  static async userRefuseApplication({
    id,
    input,
  }: GqlMutationApplicationRefuseArgs): Promise<GqlApplicationSwitchIsApprovedPayload> {
    const result = await ApplicationService.applicationRefuse({ id, input });
    return ApplicationResponseFormat.switchIsApproved(result);
  }

  static async userUpdateApplicationConfirmationComment({
    id,
    input,
  }: GqlMutationApplicationUpdateConfirmationCommentArgs): Promise<GqlApplicationUpdateConfirmationCommentPayload> {
    const updatedConfirmation = await ApplicationService.applicationUpdateConfirmationComment({
      id,
      input,
    });
    return ApplicationResponseFormat.updateConfirmationComment(updatedConfirmation);
  }

  static async userDeleteApplicationConfirmation({
    id,
    input,
  }: GqlMutationApplicationDeleteConfirmationArgs): Promise<GqlApplicationDeleteConfirmationPayload> {
    await ApplicationService.applicationDeleteConfirmation({ id, input });
    return ApplicationResponseFormat.deleteConfirmation(id, input.applicationConfirmationId);
  }
}
