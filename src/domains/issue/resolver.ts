import IssueUseCase from "@/domains/issue/usecase";
import {
  GqlQueryIssuesArgs,
  GqlQueryIssueArgs,
  GqlMutationIssueCreateArgs,
  GqlMutationIssueDeleteArgs,
  GqlMutationIssueUpdateContentArgs,
  GqlMutationIssuePublishArgs,
  GqlMutationIssueUnpublishArgs,
  GqlMutationIssueAddGroupArgs,
  GqlMutationIssueRemoveGroupArgs,
  GqlMutationIssueAddOrganizationArgs,
  GqlMutationIssueRemoveOrganizationArgs,
  GqlMutationIssueAddSkillsetArgs,
  GqlMutationIssueRemoveSkillsetArgs,
  GqlMutationIssueAddCityArgs,
  GqlMutationIssueRemoveCityArgs,
  GqlMutationIssueAddCategoryArgs,
  GqlMutationIssueRemoveCategoryArgs,
} from "@/types/graphql";

const issueResolver = {
  Query: {
    issues: async (_: unknown, args: GqlQueryIssuesArgs) => IssueUseCase.userGetManyIssues(args),
    issue: async (_: unknown, args: GqlQueryIssueArgs) => IssueUseCase.userGetIssue(args),
  },
  Mutation: {
    issueCreate: async (_: unknown, args: GqlMutationIssueCreateArgs) =>
      IssueUseCase.userCreateIssue(args),
    issueDelete: async (_: unknown, args: GqlMutationIssueDeleteArgs) =>
      IssueUseCase.userDeleteIssue(args),
    issueUpdateContent: async (_: unknown, args: GqlMutationIssueUpdateContentArgs) =>
      IssueUseCase.userUpdateContentOfIssue(args),
    issuePublish: async (_: unknown, args: GqlMutationIssuePublishArgs) =>
      IssueUseCase.userPublishIssue(args),
    issueUnpublish: async (_: unknown, args: GqlMutationIssueUnpublishArgs) =>
      IssueUseCase.userUnpublishIssue(args),
    issueAddGroup: async (_: unknown, args: GqlMutationIssueAddGroupArgs) =>
      IssueUseCase.userAddGroupToIssue(args),
    issueRemoveGroup: async (_: unknown, args: GqlMutationIssueRemoveGroupArgs) =>
      IssueUseCase.userRemoveGroupFromIssue(args),
    issueAddOrganization: async (_: unknown, args: GqlMutationIssueAddOrganizationArgs) =>
      IssueUseCase.userAddOrganizationToIssue(args),
    issueRemoveOrganization: async (_: unknown, args: GqlMutationIssueRemoveOrganizationArgs) =>
      IssueUseCase.userRemoveOrganizationFromIssue(args),
    issueAddSkillset: async (_: unknown, args: GqlMutationIssueAddSkillsetArgs) =>
      IssueUseCase.userAddSkillsetToIssue(args),
    issueRemoveSkillset: async (_: unknown, args: GqlMutationIssueRemoveSkillsetArgs) =>
      IssueUseCase.userRemoveSkillsetFromIssue(args),
    issueAddCity: async (_: unknown, args: GqlMutationIssueAddCityArgs) =>
      IssueUseCase.userAddCityToIssue(args),
    issueRemoveCity: async (_: unknown, args: GqlMutationIssueRemoveCityArgs) =>
      IssueUseCase.userRemoveCityFromIssue(args),
    issueAddCategory: async (_: unknown, args: GqlMutationIssueAddCategoryArgs) =>
      IssueUseCase.userAddCategoryToIssue(args),
    issueRemoveCategory: async (_: unknown, args: GqlMutationIssueRemoveCategoryArgs) =>
      IssueUseCase.userRemoveCategoryFromIssue(args),
  },
};

export default issueResolver;
