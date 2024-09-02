import IssueService from "@/domains/issue/service";
import {
  GqlQueryIssuesArgs,
  GqlMutationIssueCreateArgs,
  GqlQueryIssueArgs,
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
    issues: async (_: unknown, args: GqlQueryIssuesArgs) => IssueService.queryIssues(args),
    issue: async (_: unknown, args: GqlQueryIssueArgs) => IssueService.getIssue(args),
  },
  Mutation: {
    issueCreate: async (_: unknown, args: GqlMutationIssueCreateArgs) =>
      IssueService.issueCreate(args),
    issueDelete: async (_: unknown, args: GqlMutationIssueDeleteArgs) =>
      IssueService.issueDelete(args),
    issueUpdateContent: async (_: unknown, args: GqlMutationIssueUpdateContentArgs) =>
      IssueService.issueUpdateContent(args),
    issuePublish: async (_: unknown, args: GqlMutationIssuePublishArgs) =>
      IssueService.issuePublish(args),
    issueUnpublish: async (_: unknown, args: GqlMutationIssueUnpublishArgs) =>
      IssueService.issueUnpublish(args),
    issueAddGroup: async (_: unknown, args: GqlMutationIssueAddGroupArgs) =>
      IssueService.issueAddGroup(args),
    issueRemoveGroup: async (_: unknown, args: GqlMutationIssueRemoveGroupArgs) =>
      IssueService.issueRemoveGroup(args),
    issueAddOrganization: async (_: unknown, args: GqlMutationIssueAddOrganizationArgs) =>
      IssueService.issueAddOrganization(args),
    issueRemoveOrganization: async (_: unknown, args: GqlMutationIssueRemoveOrganizationArgs) =>
      IssueService.issueRemoveOrganization(args),
    issueAddSkillset: async (_: unknown, args: GqlMutationIssueAddSkillsetArgs) =>
      IssueService.issueAddSkillset(args),
    issueRemoveSkillset: async (_: unknown, args: GqlMutationIssueRemoveSkillsetArgs) =>
      IssueService.issueRemoveSkillset(args),
    issueAddCity: async (_: unknown, args: GqlMutationIssueAddCityArgs) =>
      IssueService.issueAddCity(args),
    issueRemoveCity: async (_: unknown, args: GqlMutationIssueRemoveCityArgs) =>
      IssueService.issueRemoveCity(args),
    issueAddCategory: async (_: unknown, args: GqlMutationIssueAddCategoryArgs) =>
      IssueService.issueAddCategory(args),
    issueRemoveCategory: async (_: unknown, args: GqlMutationIssueRemoveCategoryArgs) =>
      IssueService.issueRemoveCategory(args),
  },
};

export default issueResolver;
