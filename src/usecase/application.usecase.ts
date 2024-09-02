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
}
