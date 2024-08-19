import { prismaClient } from "@/prisma/client";
import {
  GqlQueryIssuesArgs,
  GqlQueryIssueArgs,
  GqlMutationIssueCreateArgs,
  GqlMutationIssueDeleteArgs,
  GqlMutationIssueUpdateArgs,
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
  GqlIssueCreatePayload,
  GqlIssueDeletePayload,
  GqlIssueUpdatePayload,
  GqlIssueUpdatePrivacyPayload,
  GqlIssuesConnection,
  GqlIssue,
  GqlIssueAddGroupPayload,
  GqlIssueRemoveGroupPayload,
  GqlIssueAddOrganizationPayload,
  GqlIssueRemoveOrganizationPayload,
  GqlIssueAddSkillsetPayload,
  GqlIssueRemoveSkillsetPayload,
  GqlIssueAddCityPayload,
  GqlIssueRemoveCityPayload,
  GqlIssueAddCategoryPayload,
  GqlIssueRemoveCategoryPayload,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class IssueService {
  private static db = prismaClient;

  static async queryIssues({
    filter,
    sort,
    cursor,
    first,
  }: GqlQueryIssuesArgs): Promise<GqlIssuesConnection> {
    const take = first ?? 10;

    const where: Prisma.IssueWhereInput = {
      AND: [
        filter?.keyword
          ? {
              OR: [{ description: { contains: filter?.keyword } }],
            }
          : {},
      ],
    };

    const orderBy: Prisma.IssueOrderByWithRelationInput[] = [
      { createdAt: sort?.createdAt ?? "desc" },
    ];

    const data = await this.db.issue.findMany({
      where,
      orderBy,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasNextPage = data.length > take;
    const formattedData = data.slice(0, take);

    return {
      totalCount: data.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: Boolean(cursor),
        startCursor: formattedData[0]?.id,
        endCursor: formattedData.length
          ? formattedData[formattedData.length - 1].id
          : undefined,
      },
      edges: formattedData.map((edge) => ({
        cursor: edge.id,
        node: edge as GqlIssue,
      })),
    };
  }

  static async getIssue({ id }: GqlQueryIssueArgs): Promise<GqlIssue | null> {
    const issue = await this.db.issue.findUnique({
      where: { id },
      include: {
        stat: { select: { totalMinutes: true } },
      },
    });

    return issue
      ? {
          ...issue,
          totalMinutes: issue.stat?.totalMinutes ?? 0,
        }
      : null;
  }

  static async issueCreate({
    input,
  }: GqlMutationIssueCreateArgs): Promise<GqlIssueCreatePayload> {
    const { skillsetIds, cityCodes, issueCategoryIds, ...properties } = input;

    const data: Prisma.IssueCreateInput = {
      ...properties,
      skillsets: { create: skillsetIds?.map((skillsetId) => ({ skillsetId })) },
      cities: { create: cityCodes?.map((cityCode) => ({ cityCode })) },
      issueCategories: {
        create: issueCategoryIds?.map((issueCategoryId) => ({
          issueCategoryId,
        })),
      },
    };

    const issue = await this.db.issue.create({
      data,
      include: {
        skillsets: { include: { skillset: true } },
        cities: { include: { city: { include: { state: true } } } },
        issueCategories: { include: { issueCategory: true } },
        stat: { select: { totalMinutes: true } },
      },
    });

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
    };
  }

  static async issueDelete({
    id,
  }: GqlMutationIssueDeleteArgs): Promise<GqlIssueDeletePayload> {
    await this.db.issue.delete({
      where: { id },
    });

    return { issueId: id };
  }

  static async issueUpdate({
    id,
    input,
  }: GqlMutationIssueUpdateArgs): Promise<GqlIssueUpdatePayload> {
    const { skillsetIds, cityCodes, issueCategoryIds, ...properties } = input;

    const data: Prisma.IssueUpdateInput = {
      ...properties,
      skillsets: {
        set: skillsetIds?.map((skillsetId) => ({
          issueId_skillsetId: {
            issueId: id,
            skillsetId: skillsetId,
          },
        })),
      },
      cities: {
        set: cityCodes?.map((cityCode) => ({
          issueId_cityCode: {
            issueId: id,
            cityCode: cityCode,
          },
        })),
      },
      issueCategories: {
        set: issueCategoryIds?.map((issueCategoryId) => ({
          issueId_issueCategoryId: {
            issueId: id,
            issueCategoryId: issueCategoryId,
          },
        })),
      },
    };

    const issue = await this.db.issue.update({
      where: { id },
      data,
      include: {
        skillsets: { include: { skillset: true } },
        cities: { include: { city: { include: { state: true } } } },
        issueCategories: { include: { issueCategory: true } },
        stat: { select: { totalMinutes: true } },
      },
    });

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
    };
  }

  static async issuePublish({
    id,
    input,
  }: GqlMutationIssuePublishArgs): Promise<GqlIssueUpdatePrivacyPayload> {
    const issue = await this.db.issue.update({
      where: { id },
      data: { isPublic: input.isPublic },
      include: {
        skillsets: { include: { skillset: true } },
        cities: { include: { city: { include: { state: true } } } },
        issueCategories: { include: { issueCategory: true } },
        stat: { select: { totalMinutes: true } },
      },
    });

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
    };
  }

  static async issueUnpublish({
    id,
    input,
  }: GqlMutationIssueUnpublishArgs): Promise<GqlIssueUpdatePrivacyPayload> {
    const issue = await this.db.issue.update({
      where: { id },
      data: { isPublic: input.isPublic },
      include: {
        skillsets: { include: { skillset: true } },
        cities: { include: { city: { include: { state: true } } } },
        issueCategories: { include: { issueCategory: true } },
        stat: { select: { totalMinutes: true } },
      },
    });

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
    };
  }

  static async issueAddGroup({
    id,
    input,
  }: GqlMutationIssueAddGroupArgs): Promise<GqlIssueAddGroupPayload> {
    const [issue, group] = await this.db.$transaction([
      this.db.issue.update({
        where: { id },
        data: {
          groups: {
            connect: {
              groupId_issueId: {
                issueId: id,
                groupId: input.groupId,
              },
            },
          },
        },
        include: {
          skillsets: { include: { skillset: true } },
          cities: { include: { city: { include: { state: true } } } },
          issueCategories: { include: { issueCategory: true } },
          stat: { select: { totalMinutes: true } },
        },
      }),
      this.db.group.findUnique({
        where: { id: input.groupId },
      }),
    ]);

    if (!group) {
      throw new Error(`Group with ID ${input.groupId} not found`);
    }

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
      group,
    };
  }

  static async issueRemoveGroup({
    id,
    input,
  }: GqlMutationIssueRemoveGroupArgs): Promise<GqlIssueRemoveGroupPayload> {
    const [issue, group] = await this.db.$transaction([
      this.db.issue.update({
        where: { id },
        data: {
          groups: {
            disconnect: {
              groupId_issueId: {
                issueId: id,
                groupId: input.groupId,
              },
            },
          },
        },
        include: {
          skillsets: { include: { skillset: true } },
          cities: { include: { city: { include: { state: true } } } },
          issueCategories: { include: { issueCategory: true } },
          stat: { select: { totalMinutes: true } },
        },
      }),
      this.db.group.findUnique({
        where: { id: input.groupId },
      }),
    ]);

    if (!group) {
      throw new Error(`Group with ID ${input.groupId} not found`);
    }

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
      group,
    };
  }

  static async issueAddOrganization({
    id,
    input,
  }: GqlMutationIssueAddOrganizationArgs): Promise<GqlIssueAddOrganizationPayload> {
    const [issue, organization] = await this.db.$transaction([
      this.db.issue.update({
        where: { id },
        data: {
          organizations: {
            connect: {
              organizationId_issueId: {
                issueId: id,
                organizationId: input.organizationId,
              },
            },
          },
        },
        include: {
          skillsets: { include: { skillset: true } },
          cities: { include: { city: { include: { state: true } } } },
          issueCategories: { include: { issueCategory: true } },
          stat: { select: { totalMinutes: true } },
        },
      }),
      this.db.organization.findUnique({
        where: { id: input.organizationId },
        include: { city: { include: { state: true } }, state: true },
      }),
    ]);

    if (!organization) {
      throw new Error(`Organization with ID ${input.organizationId} not found`);
    }

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
      organization,
    };
  }

  static async issueRemoveOrganization({
    id,
    input,
  }: GqlMutationIssueRemoveOrganizationArgs): Promise<GqlIssueRemoveOrganizationPayload> {
    const [issue, organization] = await this.db.$transaction([
      this.db.issue.update({
        where: { id },
        data: {
          organizations: {
            disconnect: {
              organizationId_issueId: {
                issueId: id,
                organizationId: input.organizationId,
              },
            },
          },
        },
        include: {
          skillsets: { include: { skillset: true } },
          cities: { include: { city: { include: { state: true } } } },
          issueCategories: { include: { issueCategory: true } },
          stat: { select: { totalMinutes: true } },
        },
      }),
      this.db.organization.findUnique({
        where: { id: input.organizationId },
        include: { city: { include: { state: true } }, state: true },
      }),
    ]);

    if (!organization) {
      throw new Error(`Organization with ID ${input.organizationId} not found`);
    }

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
      organization,
    };
  }

  static async issueAddSkillset({
    id,
    input,
  }: GqlMutationIssueAddSkillsetArgs): Promise<GqlIssueAddSkillsetPayload> {
    const [issue, skillset] = await this.db.$transaction([
      this.db.issue.update({
        where: { id },
        data: {
          skillsets: {
            connect: {
              issueId_skillsetId: {
                issueId: id,
                skillsetId: input.skillsetId,
              },
            },
          },
        },
        include: {
          skillsets: { include: { skillset: true } },
          cities: { include: { city: { include: { state: true } } } },
          issueCategories: { include: { issueCategory: true } },
          stat: { select: { totalMinutes: true } },
        },
      }),
      this.db.skillset.findUnique({
        where: { id: input.skillsetId },
      }),
    ]);

    if (!skillset) {
      throw new Error(`Skillset with ID ${input.skillsetId} not found`);
    }

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
      skillset,
    };
  }

  static async issueRemoveSkillset({
    id,
    input,
  }: GqlMutationIssueRemoveSkillsetArgs): Promise<GqlIssueRemoveSkillsetPayload> {
    const [issue, skillset] = await this.db.$transaction([
      this.db.issue.update({
        where: { id },
        data: {
          skillsets: {
            disconnect: {
              issueId_skillsetId: {
                issueId: id,
                skillsetId: input.skillsetId,
              },
            },
          },
        },
        include: {
          skillsets: { include: { skillset: true } },
          cities: { include: { city: { include: { state: true } } } },
          issueCategories: { include: { issueCategory: true } },
          stat: { select: { totalMinutes: true } },
        },
      }),
      this.db.skillset.findUnique({
        where: { id: input.skillsetId },
      }),
    ]);

    if (!skillset) {
      throw new Error(`Skillset with ID ${input.skillsetId} not found`);
    }

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
      skillset,
    };
  }

  static async issueAddCity({
    id,
    input,
  }: GqlMutationIssueAddCityArgs): Promise<GqlIssueAddCityPayload> {
    const [issue, city] = await this.db.$transaction([
      this.db.issue.update({
        where: { id },
        data: {
          cities: {
            connect: {
              issueId_cityCode: {
                issueId: id,
                cityCode: input.cityId,
              },
            },
          },
        },
        include: {
          skillsets: { include: { skillset: true } },
          cities: { include: { city: { include: { state: true } } } },
          issueCategories: { include: { issueCategory: true } },
          stat: { select: { totalMinutes: true } },
        },
      }),
      this.db.city.findUnique({
        where: { code: input.cityId },
        include: { state: true },
      }),
    ]);

    if (!city) {
      throw new Error(`City with ID ${input.cityId} not found`);
    }

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
      city,
    };
  }

  static async issueRemoveCity({
    id,
    input,
  }: GqlMutationIssueRemoveCityArgs): Promise<GqlIssueRemoveCityPayload> {
    const [issue, city] = await this.db.$transaction([
      this.db.issue.update({
        where: { id },
        data: {
          cities: {
            disconnect: {
              issueId_cityCode: {
                issueId: id,
                cityCode: input.cityId,
              },
            },
          },
        },
        include: {
          skillsets: { include: { skillset: true } },
          cities: { include: { city: { include: { state: true } } } },
          issueCategories: { include: { issueCategory: true } },
          stat: { select: { totalMinutes: true } },
        },
      }),
      this.db.city.findUnique({
        where: { code: input.cityId },
        include: { state: true },
      }),
    ]);

    if (!city) {
      throw new Error(`City with ID ${input.cityId} not found`);
    }

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
      city,
    };
  }

  static async issueAddCategory({
    id,
    input,
  }: GqlMutationIssueAddCategoryArgs): Promise<GqlIssueAddCategoryPayload> {
    const [issue, category] = await this.db.$transaction([
      this.db.issue.update({
        where: { id },
        data: {
          issueCategories: {
            connect: {
              issueId_issueCategoryId: {
                issueId: id,
                issueCategoryId: input.categoryId,
              },
            },
          },
        },
        include: {
          skillsets: { include: { skillset: true } },
          cities: { include: { city: { include: { state: true } } } },
          issueCategories: { include: { issueCategory: true } },
          stat: { select: { totalMinutes: true } },
        },
      }),
      this.db.issueCategory.findUnique({
        where: { id: input.categoryId },
      }),
    ]);

    if (!category) {
      throw new Error(`Category with ID ${input.categoryId} not found`);
    }

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
      category,
    };
  }

  static async issueRemoveCategory({
    id,
    input,
  }: GqlMutationIssueRemoveCategoryArgs): Promise<GqlIssueRemoveCategoryPayload> {
    const [issue, category] = await this.db.$transaction([
      this.db.issue.update({
        where: { id },
        data: {
          issueCategories: {
            disconnect: {
              issueId_issueCategoryId: {
                issueId: id,
                issueCategoryId: input.categoryId,
              },
            },
          },
        },
        include: {
          skillsets: { include: { skillset: true } },
          cities: { include: { city: { include: { state: true } } } },
          issueCategories: { include: { issueCategory: true } },
          stat: { select: { totalMinutes: true } },
        },
      }),
      this.db.issueCategory.findUnique({
        where: { id: input.categoryId },
      }),
    ]);

    if (!category) {
      throw new Error(`Category with ID ${input.categoryId} not found`);
    }

    return {
      issue: {
        ...issue,
        totalMinutes: issue.stat?.totalMinutes ?? 0,
        skillsets: issue.skillsets.map((r) => r.skillset),
        cities: issue.cities.map((r) => r.city),
        issueCategories: issue.issueCategories.map((r) => r.issueCategory),
      },
      category,
    };
  }
}
