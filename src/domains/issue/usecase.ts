import {
  GqlMutationIssueCreateArgs,
  GqlMutationIssueDeleteArgs,
  GqlMutationIssueAddGroupArgs,
  GqlMutationIssueRemoveGroupArgs,
  GqlMutationIssueAddOrganizationArgs,
  GqlMutationIssueRemoveOrganizationArgs,
  GqlQueryIssuesArgs,
  GqlQueryIssueArgs,
  GqlMutationIssueUpdateContentArgs,
  GqlMutationIssuePublishArgs,
  GqlMutationIssueUnpublishArgs,
  GqlIssueCreatePayload,
  GqlIssueDeletePayload,
  GqlIssueUpdateContentPayload,
  GqlIssueUpdatePrivacyPayload,
  GqlIssuesConnection,
  GqlIssue,
  GqlIssueUpdateCategoryPayload,
  GqlIssueUpdateGroupPayload,
  GqlIssueUpdateOrganizationPayload,
  GqlMutationIssueAddSkillsetArgs,
  GqlIssueUpdateSkillsetPayload,
  GqlMutationIssueRemoveCategoryArgs,
  GqlMutationIssueAddCategoryArgs,
  GqlIssueUpdateCityPayload,
  GqlMutationIssueRemoveCityArgs,
  GqlMutationIssueAddCityArgs,
  GqlMutationIssueRemoveSkillsetArgs,
} from "@/types/graphql";
import IssueService from "@/domains/issue/service";
import GroupService from "@/domains/group/service";
import OrganizationService from "@/domains/organization/service";
import MasterService from "@/domains/master/service";
import IssueResponseFormat from "@/domains/issue/presenter/response";

export default class IssueUseCase {
  static async userGetManyIssues({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryIssuesArgs): Promise<GqlIssuesConnection> {
    const take = first ?? 10;
    const data = await IssueService.fetchIssues({ cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const issues: GqlIssue[] = data.slice(0, take).map((record) => {
      return IssueResponseFormat.get(record);
    });

    return IssueResponseFormat.query(issues, hasNextPage);
  }

  static async userGetIssue({ id }: GqlQueryIssueArgs): Promise<GqlIssue | null> {
    const issue = await IssueService.getIssue({ id });
    if (!issue) {
      return null;
    }
    return IssueResponseFormat.get(issue);
  }

  static async userCreateIssue({
    input,
  }: GqlMutationIssueCreateArgs): Promise<GqlIssueCreatePayload> {
    const issue = await IssueService.issueCreate({ input });
    return IssueResponseFormat.create(issue);
  }

  static async userDeleteIssue({ id }: GqlMutationIssueDeleteArgs): Promise<GqlIssueDeletePayload> {
    await IssueService.issueDelete({ id });
    return IssueResponseFormat.delete(id);
  }

  static async userUpdateContentOfIssue({
    id,
    input,
  }: GqlMutationIssueUpdateContentArgs): Promise<GqlIssueUpdateContentPayload> {
    const issue = await IssueService.issueUpdateContent({ id, input });
    return IssueResponseFormat.updateContent(issue);
  }

  static async userPublishIssue({
    id,
    input,
  }: GqlMutationIssuePublishArgs): Promise<GqlIssueUpdatePrivacyPayload> {
    const issue = await IssueService.issuePublish({ id, input });
    return IssueResponseFormat.switchPrivacy(issue);
  }

  static async userUnpublishIssue({
    id,
    input,
  }: GqlMutationIssueUnpublishArgs): Promise<GqlIssueUpdatePrivacyPayload> {
    const issue = await IssueService.issueUnpublish({ id, input });
    return IssueResponseFormat.switchPrivacy(issue);
  }

  static async userAddGroupToIssue({
    id,
    input,
  }: GqlMutationIssueAddGroupArgs): Promise<GqlIssueUpdateGroupPayload> {
    const group = await GroupService.checkIfGroupExists(input.groupId);
    const issue = await IssueService.issueAddGroup({ id, input });
    return IssueResponseFormat.updateGroup(issue, group);
  }

  static async userRemoveGroupFromIssue({
    id,
    input,
  }: GqlMutationIssueRemoveGroupArgs): Promise<GqlIssueUpdateGroupPayload> {
    const group = await GroupService.checkIfGroupExists(input.groupId);
    const issue = await IssueService.issueRemoveGroup({ id, input });
    return IssueResponseFormat.updateGroup(issue, group);
  }

  static async userAddOrganizationToIssue({
    id,
    input,
  }: GqlMutationIssueAddOrganizationArgs): Promise<GqlIssueUpdateOrganizationPayload> {
    const organization = await OrganizationService.checkIfOrganizationExists(input.organizationId);
    const issue = await IssueService.issueAddOrganization({ id, input });
    return IssueResponseFormat.updateOrganization(issue, organization);
  }

  static async userRemoveOrganizationFromIssue({
    id,
    input,
  }: GqlMutationIssueRemoveOrganizationArgs): Promise<GqlIssueUpdateOrganizationPayload> {
    const organization = await OrganizationService.checkIfOrganizationExists(input.organizationId);

    const issue = await IssueService.issueRemoveOrganization({ id, input });
    return IssueResponseFormat.updateOrganization(issue, organization);
  }

  static async userAddSkillsetToIssue({
    id,
    input,
  }: GqlMutationIssueAddSkillsetArgs): Promise<GqlIssueUpdateSkillsetPayload> {
    const skillset = await MasterService.checkIfSkillsetExists(input.skillsetId);

    const issue = await IssueService.issueAddSkillset({ id, input });
    return IssueResponseFormat.updateSkillset(issue, skillset);
  }

  static async userRemoveSkillsetFromIssue({
    id,
    input,
  }: GqlMutationIssueRemoveSkillsetArgs): Promise<GqlIssueUpdateSkillsetPayload> {
    const skillset = await MasterService.checkIfSkillsetExists(input.skillsetId);

    const issue = await IssueService.issueRemoveSkillset({ id, input });
    return IssueResponseFormat.updateSkillset(issue, skillset);
  }

  static async userAddCityToIssue({
    id,
    input,
  }: GqlMutationIssueAddCityArgs): Promise<GqlIssueUpdateCityPayload> {
    const city = await MasterService.checkIfCityExists(input.cityId);

    const issue = await IssueService.issueAddCity({ id, input });
    return IssueResponseFormat.updateCity(issue, city);
  }

  static async userRemoveCityFromIssue({
    id,
    input,
  }: GqlMutationIssueRemoveCityArgs): Promise<GqlIssueUpdateCityPayload> {
    const city = await MasterService.checkIfCityExists(input.cityId);

    const issue = await IssueService.issueRemoveCity({ id, input });
    return IssueResponseFormat.updateCity(issue, city);
  }

  static async userAddCategoryToIssue({
    id,
    input,
  }: GqlMutationIssueAddCategoryArgs): Promise<GqlIssueUpdateCategoryPayload> {
    const category = await MasterService.checkIfIssueCategoryExists(input.categoryId);

    const issue = await IssueService.issueAddCategory({ id, input });
    return IssueResponseFormat.updateCategory(issue, category);
  }

  static async userRemoveCategoryFromIssue({
    id,
    input,
  }: GqlMutationIssueRemoveCategoryArgs): Promise<GqlIssueUpdateCategoryPayload> {
    const category = await MasterService.checkIfIssueCategoryExists(input.categoryId);

    const issue = await IssueService.issueRemoveCategory({ id, input });
    return IssueResponseFormat.updateCategory(issue, category);
  }
}
