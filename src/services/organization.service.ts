import {
  GqlOrganization,
  GqlOrganizationsConnection,
  GqlQueryOrganizationArgs,
  GqlQueryOrganizationsArgs,
  GqlOrganizationAddTargetPayload,
  GqlOrganizationAddUserPayload,
  GqlMutationOrganizationAddTargetArgs,
  GqlMutationOrganizationAddUserArgs,
  GqlMutationOrganizationCreateArgs,
  GqlMutationOrganizationDeleteArgs,
  GqlMutationOrganizationRemoveTargetArgs,
  GqlMutationOrganizationRemoveUserArgs,
  GqlMutationOrganizationAddGroupArgs,
  GqlMutationOrganizationRemoveGroupArgs,
  GqlOrganizationDeletePayload,
  GqlOrganizationCreatePayload,
  GqlOrganizationRemoveTargetPayload,
  GqlOrganizationRemoveUserPayload,
  GqlMutationOrganizationUpdateDefaultArgs,
  GqlOrganizationUpdateDefaultPayload,
  GqlMutationOrganizationPublishArgs,
  GqlMutationOrganizationUnpublishArgs,
  GqlOrganizationRemoveGroupPayload,
  GqlOrganizationAddGroupPayload,
  GqlOrganizationUpdatePrivacyPayload,
  GqlOrganizationUpdateContentPayload,
  GqlMutationOrganizationUpdateContentArgs,
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import OrganizationRepository from "@/prisma/repository/organization.repository";

export default class OrganizationService {
  private static db = prismaClient;

  static async checkIfOrganizationExists(id: string): Promise<GqlOrganization> {
    const organization = await OrganizationRepository.findOrganizationById(id);
    if (!organization) {
      throw new Error(`Group with ID ${id} not found`);
    }
    return organization;
  }

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
        filter?.agendaId ? { agendas: { some: { agendaId: filter?.agendaId } } } : {},
        filter?.keyword
          ? {
              OR: [{ name: { contains: filter?.keyword } }, { bio: { contains: filter?.keyword } }],
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
        users: {
          include: {
            user: true,
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
        node: {
          ...edge,
          users: edge.users.map((u) => u.user),
        },
      })),
    };
  }

  static async getOrganization({ id }: GqlQueryOrganizationArgs): Promise<GqlOrganization | null> {
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

  static async organizationCreate({
    input,
  }: GqlMutationOrganizationCreateArgs): Promise<GqlOrganizationCreatePayload> {
    const { agendaIds, cityCode, stateCode, stateCountryCode, ...properties } = input;
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
    const organization = await this.db.organization.create({
      data,
      include: {
        city: { include: { state: true } },
        state: true,
      },
    });
    return { organization };
  }

  static async organizationDelete({
    id,
  }: GqlMutationOrganizationDeleteArgs): Promise<GqlOrganizationDeletePayload> {
    await this.db.organization.delete({
      where: { id },
    });
    return { organizationId: id };
  }

  static async organizationUpdateDefault({
    id,
    input,
  }: GqlMutationOrganizationUpdateDefaultArgs): Promise<GqlOrganizationUpdateDefaultPayload> {
    const organization = await this.db.organization.update({
      where: { id },
      data: input,
      include: {
        city: {
          include: {
            state: true,
          },
        },
        state: true,
      },
    });
    return { organization };
  }

  static async organizationUpdateContent({
    id,
    input,
  }: GqlMutationOrganizationUpdateContentArgs): Promise<GqlOrganizationUpdateContentPayload> {
    const organization = await this.db.organization.update({
      where: { id },
      data: input,
      include: {
        city: {
          include: {
            state: true,
          },
        },
        state: true,
      },
    });
    return { organization };
  }

  static async organizationAddUser({
    id,
    input,
  }: GqlMutationOrganizationAddUserArgs): Promise<GqlOrganizationAddUserPayload> {
    const [organization, user] = await this.db.$transaction([
      this.db.organization.update({
        where: { id },
        data: {
          users: {
            connect: {
              userId_organizationId: {
                organizationId: id,
                userId: input.userId,
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
        where: { id: input.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    return {
      organization,
      user,
    };
  }

  static async organizationRemoveUser({
    id,
    input,
  }: GqlMutationOrganizationRemoveUserArgs): Promise<GqlOrganizationRemoveUserPayload> {
    const [organization, user] = await this.db.$transaction([
      this.db.organization.update({
        where: { id },
        data: {
          users: {
            disconnect: {
              userId_organizationId: {
                organizationId: id,
                userId: input.userId,
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
        where: { id: input.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    return {
      organization,
      user,
    };
  }

  static async organizationAddTarget({
    id,
    input,
  }: GqlMutationOrganizationAddTargetArgs): Promise<GqlOrganizationAddTargetPayload> {
    const [organization, target] = await this.db.$transaction([
      this.db.organization.update({
        where: { id },
        data: {
          targets: {
            connect: { id: input.targetId },
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
        where: { id: input.targetId },
      }),
    ]);

    if (!target) {
      throw new Error(`Target with ID ${input.targetId} not found`);
    }

    return {
      organization,
      target,
    };
  }

  static async organizationRemoveTarget({
    id,
    input,
  }: GqlMutationOrganizationRemoveTargetArgs): Promise<GqlOrganizationRemoveTargetPayload> {
    const [organization, target] = await this.db.$transaction([
      this.db.organization.update({
        where: { id },
        data: {
          targets: {
            disconnect: { id: input.targetId },
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
        where: { id: input.targetId },
      }),
    ]);

    if (!target) {
      throw new Error(`Target with ID ${input.targetId} not found`);
    }

    return {
      organization,
      target,
    };
  }

  static async organizationAddGroup({
    id,
    input,
  }: GqlMutationOrganizationAddGroupArgs): Promise<GqlOrganizationAddGroupPayload> {
    const [organization, group] = await this.db.$transaction([
      this.db.organization.update({
        where: { id },
        data: {
          groups: {
            connect: { id: input.groupId },
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
        where: { id: input.groupId },
      }),
    ]);

    if (!group) {
      throw new Error(`Group with ID ${input.groupId} not found`);
    }

    return {
      organization,
      group,
    };
  }

  static async organizationRemoveGroup({
    id,
    input,
  }: GqlMutationOrganizationRemoveGroupArgs): Promise<GqlOrganizationRemoveGroupPayload> {
    const [organization, group] = await this.db.$transaction([
      this.db.organization.update({
        where: { id },
        data: {
          groups: {
            disconnect: { id: input.groupId },
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
        where: { id: input.groupId },
      }),
    ]);

    if (!group) {
      throw new Error(`Group with ID ${input.groupId} not found`);
    }

    return {
      organization,
      group,
    };
  }

  static async organizationPublish({
    id,
  }: GqlMutationOrganizationPublishArgs): Promise<GqlOrganizationUpdatePrivacyPayload> {
    const organization = await this.db.organization.update({
      where: { id },
      data: { isPublic: true },
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

  static async organizationUnpublish({
    id,
  }: GqlMutationOrganizationUnpublishArgs): Promise<GqlOrganizationUpdatePrivacyPayload> {
    const organization = await this.db.organization.update({
      where: { id },
      data: { isPublic: false },
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
}
