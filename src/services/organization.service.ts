import {
  GqlAddTargetInOrganizationPayload,
  GqlAddUserInOrganizationPayload,
  GqlMutationAddTargetInOrganizationArgs,
  GqlMutationAddUserInOrganizationArgs,
  GqlMutationCreateOrganizationArgs,
  GqlMutationDeleteOrganizationArgs,
  GqlMutationRemoveTargetFromOrganizationArgs,
  GqlMutationRemoveUserFromOrganizationArgs,
  GqlMutationUpdateGroupOfOrganizationArgs,
  GqlMutationUpdateOrganizationDefaultInfoArgs,
  GqlMutationUpdateOrganizationOverviewArgs,
  GqlOrganization,
  GqlOrganizationsConnection,
  GqlQueryOrganizationArgs,
  GqlQueryOrganizationsArgs,
  GqlRemoveTargetFromOrganizationPayload,
  GqlRemoveUserFromOrganizationPayload,
  GqlUpdateGroupOfOrganizationPayload,
  GqlUpdateOrganizationDefaultInfoPayload,
  GqlUpdateOrganizationOverviewPayload,
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";

export default class OrganizationService {
  private static db = prismaClient;

  // TODO: check userId, cities, etc. -> filter
  static async queryOrganizations({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryOrganizationsArgs): Promise<GqlOrganizationsConnection> {
    const take = first ?? 10;
    const where: Prisma.OrganizationWhereInput = {
      AND: [
        filter?.agendaId
          ? { agendas: { some: { agendaId: filter?.agendaId } } }
          : {},
        filter?.keyword
          ? {
              OR: [
                { name: { contains: filter?.keyword } },
                { bio: { contains: filter?.keyword } },
              ],
            }
          : {},
      ],
    };
    const orderBy: Prisma.OrganizationOrderByWithAggregationInput = {
      updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc,
    };

    const data = await this.db.organization.findMany({
      where,
      include: {
        city: {
          include: {
            state: true,
          },
        },
        state: true,
      },
      orderBy,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const hasNextPage = data.length > take;
    return {
      totalCount: data.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: data[0]?.id,
        endCursor: data.length ? data[data.length - 1].id : undefined,
      },
      edges: data.slice(0, take).map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static async getOrganization({
    id,
  }: GqlQueryOrganizationArgs): Promise<GqlOrganization | null> {
    return this.db.organization.findUnique({
      where: { id },
      include: {
        city: {
          include: {
            state: true,
          },
        },
        state: true,
      },
    });
  }

  static async createOrganization({
    content,
  }: GqlMutationCreateOrganizationArgs): Promise<GqlOrganization> {
    const { agendaIds, cityCode, stateCode, stateCountryCode, ...properties } =
      content;
    const data: Prisma.OrganizationCreateInput = {
      ...properties,
      state: {
        connect: {
          code_countryCode: { code: stateCode, countryCode: stateCountryCode },
        },
      },
      city: {
        connect: { code: cityCode },
      },
      agendas: {
        create: agendaIds?.map((agendaId) => ({ agendaId })),
      },
    };
    return this.db.organization.create({
      data,
      include: {
        city: { include: { state: true } },
        state: true,
      },
    });
  }

  static async deleteOrganization({
    id,
  }: GqlMutationDeleteOrganizationArgs): Promise<GqlOrganization> {
    return this.db.organization.delete({
      where: { id },
      include: {
        city: {
          include: {
            state: true,
          },
        },
        state: true,
      },
    });
  }

  static async updateOrganizationDefaultInfo({
    id,
    content,
  }: GqlMutationUpdateOrganizationDefaultInfoArgs): Promise<GqlUpdateOrganizationDefaultInfoPayload> {
    const organization = await this.db.organization.update({
      where: { id },
      data: content,
      include: {
        city: {
          include: {
            state: true,
          },
        },
        state: true,
      },
    });

    return {
      organization,
    };
  }

  static async updateOrganizationOverview({
    id,
    content,
  }: GqlMutationUpdateOrganizationOverviewArgs): Promise<GqlUpdateOrganizationOverviewPayload> {
    const organization = await this.db.organization.update({
      where: { id },
      data: content,
      include: {
        city: {
          include: {
            state: true,
          },
        },
        state: true,
      },
    });

    return {
      organization,
    };
  }

  static async addUserInOrganization({
    id,
    content,
  }: GqlMutationAddUserInOrganizationArgs): Promise<GqlAddUserInOrganizationPayload> {
    const [organization, user] = await this.db.$transaction([
      this.db.organization.update({
        where: { id },
        data: {
          users: {
            connect: {
              userId_organizationId: {
                organizationId: id,
                userId: content.userId,
              },
            },
          },
        },
        include: {
          city: {
            include: {
              state: true,
            },
          },
          state: true,
        },
      }),
      this.db.user.findUnique({
        where: { id: content.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${content.userId} not found`);
    }

    return {
      organization,
      user,
    };
  }

  static async removeUserFromOrganization({
    id,
    content,
  }: GqlMutationRemoveUserFromOrganizationArgs): Promise<GqlRemoveUserFromOrganizationPayload> {
    const [organization, user] = await this.db.$transaction([
      this.db.organization.update({
        where: { id },
        data: {
          users: {
            disconnect: {
              userId_organizationId: {
                organizationId: id,
                userId: content.userId,
              },
            },
          },
        },
        include: {
          city: {
            include: {
              state: true,
            },
          },
          state: true,
        },
      }),
      this.db.user.findUnique({
        where: { id: content.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${content.userId} not found`);
    }

    return {
      organization,
      user,
    };
  }

  static async addTargetInOrganization({
    id,
    content,
  }: GqlMutationAddTargetInOrganizationArgs): Promise<GqlAddTargetInOrganizationPayload> {
    const [organization, target] = await this.db.$transaction([
      this.db.organization.update({
        where: { id },
        data: {
          targets: {
            connect: { id: content.targetId },
          },
        },
        include: {
          city: {
            include: {
              state: true,
            },
          },
          state: true,
        },
      }),
      this.db.target.findUnique({
        where: { id: content.targetId },
      }),
    ]);

    if (!target) {
      throw new Error(`Target with ID ${content.targetId} not found`);
    }

    return {
      organization,
      target,
    };
  }

  static async removeTargetFromOrganization({
    id,
    content,
  }: GqlMutationRemoveTargetFromOrganizationArgs): Promise<GqlRemoveTargetFromOrganizationPayload> {
    const [organization, target] = await this.db.$transaction([
      this.db.organization.update({
        where: { id },
        data: {
          targets: {
            disconnect: { id: content.targetId },
          },
        },
        include: {
          city: {
            include: {
              state: true,
            },
          },
          state: true,
        },
      }),
      this.db.target.findUnique({
        where: { id: content.targetId },
      }),
    ]);

    if (!target) {
      throw new Error(`Target with ID ${content.targetId} not found`);
    }

    return {
      organization,
      target,
    };
  }

  static async updateOrganizationOfGroup({
    id,
    content,
  }: GqlMutationUpdateGroupOfOrganizationArgs): Promise<GqlUpdateGroupOfOrganizationPayload> {
    const [organization, group] = await this.db.$transaction([
      this.db.organization.update({
        where: { id },
        data: {
          groups: {
            connect: { id: content.groupId },
          },
        },
        include: {
          city: {
            include: {
              state: true,
            },
          },
          state: true,
        },
      }),
      this.db.group.findUnique({
        where: { id: content.groupId },
      }),
    ]);

    if (!group) {
      throw new Error(`Group with ID ${content.groupId} not found`);
    }

    return {
      organization,
      group,
    };
  }
}
