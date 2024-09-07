import {
  GqlIssue,
  GqlIssueDeleteSuccess,
  GqlIssueCreateSuccess,
  GqlIssuesConnection,
  GqlIssueUpdateContentSuccess,
  GqlIssueUpdateGroupSuccess,
  GqlIssueUpdateOrganizationSuccess,
  GqlIssueUpdatePrivacySuccess,
  GqlGroup,
  GqlOrganization,
  GqlIssueCategory,
  GqlSkillset,
  GqlCity,
  GqlIssueUpdateCategorySuccess,
  GqlIssueUpdateSkillsetSuccess,
  GqlIssueUpdateCitySuccess,
} from "@/types/graphql";
import {
  IssueCreatePayloadWithArgs,
  IssueGetPayloadWithArgs,
  IssueUpdateContentPayloadWithArgs,
} from "@/domains/issue/type";

export default class IssueResponseFormat {
  static query(issues: GqlIssue[], hasNextPage: boolean): GqlIssuesConnection {
    return {
      totalCount: issues.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: issues[0]?.id,
        endCursor: issues.length ? issues[issues.length - 1].id : undefined,
      },
      edges: issues.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(issue: IssueGetPayloadWithArgs): GqlIssue {
    return {
      ...issue,
      issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      cities: issue.cities?.map((r) => ({
        ...r.city,
        state: r.city.state,
      })),
      skillsets: issue.skillsets?.map((r) => r.skillset),
      organizations: issue.organizations?.map((r) => ({
        ...r.organization,
        city: {
          ...r.organization.city,
          state: r.organization.city.state,
        },
        state: r.organization.state,
      })),
      groups: issue.groups?.map((r) => r.group),
      activities: issue.activities
        ? {
            data: issue.activities,
            total: issue._count.activities,
          }
        : undefined,
      likes: issue.likes
        ? {
            data: issue.likes,
            total: issue._count.likes,
          }
        : undefined,
      comments: issue.comments
        ? {
            data: issue.comments,
            total: issue._count.comments,
          }
        : undefined,
    };
  }

  static create(issue: IssueCreatePayloadWithArgs): GqlIssueCreateSuccess {
    return {
      __typename: "IssueCreateSuccess",
      issue: {
        ...issue,
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
        cities: issue.cities.map((r) => ({
          ...r.city,
          state: r.city.state,
        })),
        skillsets: issue.skillsets.map((r) => r.skillset),
        organizations: issue.organizations.map((r) => ({
          ...r.organization,
          city: {
            ...r.organization.city,
            state: r.organization.city.state,
          },
          state: r.organization.state,
        })),
        groups: issue.groups.map((r) => r.group),
      },
    };
  }

  static updateContent(issue: IssueUpdateContentPayloadWithArgs): GqlIssueUpdateContentSuccess {
    return {
      __typename: "IssueUpdateContentSuccess",
      issue: {
        ...issue,
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
        cities: issue.cities.map((r) => ({
          ...r.city,
          state: r.city.state,
        })),
        skillsets: issue.skillsets.map((r) => r.skillset),
      },
    };
  }

  static delete(id: string): GqlIssueDeleteSuccess {
    return { issueId: id };
  }

  static switchPrivacy(issue: GqlIssue): GqlIssueUpdatePrivacySuccess {
    return {
      __typename: "IssueUpdatePrivacySuccess",
      issue,
    };
  }

  static updateGroup(issue: GqlIssue, group: GqlGroup): GqlIssueUpdateGroupSuccess {
    return {
      __typename: "IssueUpdateGroupSuccess",
      issue,
      group,
    };
  }

  static updateOrganization(
    issue: GqlIssue,
    organization: GqlOrganization,
  ): GqlIssueUpdateOrganizationSuccess {
    return {
      __typename: "IssueUpdateOrganizationSuccess",
      issue,
      organization,
    };
  }

  static updateCategory(
    issue: GqlIssue,
    issueCategory: GqlIssueCategory,
  ): GqlIssueUpdateCategorySuccess {
    return {
      __typename: "IssueUpdateCategorySuccess",
      issue,
      issueCategory,
    };
  }

  static updateSkillset(issue: GqlIssue, skillset: GqlSkillset): GqlIssueUpdateSkillsetSuccess {
    return {
      __typename: "IssueUpdateSkillsetSuccess",
      issue,
      skillset,
    };
  }

  static updateCity(issue: GqlIssue, city: GqlCity): GqlIssueUpdateCitySuccess {
    return {
      __typename: "IssueUpdateCitySuccess",
      issue,
      city,
    };
  }
}
