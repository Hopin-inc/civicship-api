import { GqlIssueCreateInput, GqlQueryIssuesArgs } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { RELATION_ACTION } from "@/consts/prisma";

export default class IssueInputFormat {
  static filter({ filter }: GqlQueryIssuesArgs): Prisma.IssueWhereInput {
    return {
      AND: [
        filter?.keyword
          ? {
              OR: [{ description: { contains: filter?.keyword } }],
            }
          : {},
      ],
    };
  }

  static sort({ sort }: GqlQueryIssuesArgs): Prisma.IssueOrderByWithRelationInput {
    return {
      createdAt: sort?.createdAt ?? Prisma.SortOrder.desc,
    };
  }

  static create(input: GqlIssueCreateInput): Prisma.IssueCreateInput {
    const { organizationIds, groupIds, skillsetIds, cityCodes, issueCategoryIds, ...properties } =
      input;

    return {
      ...properties,
      cities: {
        createMany: {
          data:
            cityCodes?.map((cityCode) => ({
              cityCode,
            })) ?? [],
          skipDuplicates: true,
        },
      },
      skillsets: {
        createMany: {
          data:
            skillsetIds?.map((skillsetId) => ({
              skillsetId,
            })) ?? [],
          skipDuplicates: true,
        },
      },
      organizations: {
        createMany: {
          data:
            organizationIds?.map((organizationId) => ({
              organizationId,
            })) ?? [],
          skipDuplicates: true,
        },
      },
      groups: {
        createMany: {
          data:
            groupIds?.map((groupId) => ({
              groupId,
            })) ?? [],
          skipDuplicates: true,
        },
      },
      issueCategories: {
        createMany: {
          data:
            issueCategoryIds?.map((issueCategoryId) => ({
              issueCategoryId,
            })) ?? [],
          skipDuplicates: true,
        },
      },
    };
  }

  static updateGroup(
    id: string,
    groupId: string,
    action: RELATION_ACTION,
  ): Prisma.IssueUpdateInput {
    const data: Prisma.IssueUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT_OR_CREATE:
        data.groups = {
          connectOrCreate: {
            where: {
              groupId_issueId: { groupId, issueId: id },
            },
            create: { groupId },
          },
        };
        break;

      case RELATION_ACTION.DELETE:
        data.groups = {
          delete: {
            groupId_issueId: { groupId, issueId: id },
            groupId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateOrganization(
    id: string,
    organizationId: string,
    action: RELATION_ACTION,
  ): Prisma.IssueUpdateInput {
    const data: Prisma.IssueUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT_OR_CREATE:
        data.organizations = {
          connectOrCreate: {
            where: {
              organizationId_issueId: { organizationId, issueId: id },
            },
            create: { organizationId },
          },
        };
        break;

      case RELATION_ACTION.DELETE:
        data.organizations = {
          delete: {
            organizationId_issueId: { organizationId, issueId: id },
            organizationId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateSkillset(
    id: string,
    skillsetId: number,
    action: RELATION_ACTION,
  ): Prisma.IssueUpdateInput {
    const data: Prisma.IssueUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT_OR_CREATE:
        data.skillsets = {
          connectOrCreate: {
            where: {
              issueId_skillsetId: { issueId: id, skillsetId },
            },
            create: { skillsetId },
          },
        };
        break;

      case RELATION_ACTION.DELETE:
        data.skillsets = {
          delete: {
            issueId_skillsetId: { issueId: id, skillsetId },
            skillsetId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateCity(
    id: string,
    cityCode: string,
    action: RELATION_ACTION,
  ): Prisma.IssueUpdateInput {
    const data: Prisma.IssueUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT_OR_CREATE:
        data.cities = {
          connectOrCreate: {
            where: {
              issueId_cityCode: { issueId: id, cityCode },
            },
            create: { cityCode },
          },
        };
        break;

      case RELATION_ACTION.DELETE:
        data.cities = {
          delete: {
            issueId_cityCode: { issueId: id, cityCode },
            cityCode,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateCategory(
    id: string,
    issueCategoryId: number,
    action: RELATION_ACTION,
  ): Prisma.IssueUpdateInput {
    const data: Prisma.IssueUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECT_OR_CREATE:
        data.issueCategories = {
          connectOrCreate: {
            where: {
              issueId_issueCategoryId: { issueId: id, issueCategoryId },
            },
            create: { issueCategoryId },
          },
        };
        break;

      case RELATION_ACTION.DELETE:
        data.issueCategories = {
          delete: {
            issueId_issueCategoryId: { issueId: id, issueCategoryId },
            issueCategoryId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }
}
