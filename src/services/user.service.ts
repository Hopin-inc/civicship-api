import {
  GqlAddActivityToUserPayload,
  GqlAddGroupToUserPayload,
  GqlAddOrganizationToUserPayload,
  GqlRemoveActivityFromUserPayload,
  GqlRemoveGroupFromUserPayload,
  GqlRemoveOrganizationFromUserPayload,
  GqlMutationAddActivityToUserArgs,
  GqlMutationAddGroupToUserArgs,
  GqlMutationAddOrganizationToUserArgs,
  GqlMutationCreateUserArgs,
  GqlMutationRemoveActivityFromUserArgs,
  GqlMutationRemoveGroupFromUserArgs,
  GqlMutationRemoveOrganizationFromUserArgs,
  GqlMutationDeleteUserArgs,
  GqlMutationUpdateUserPrivacyArgs,
  GqlMutationUpdateUserProfileArgs,
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
  GqlUpdateUserPrivacyPayload,
  GqlUpdateUserProfilePayload,
  GqlUser,
  GqlUsersConnection,
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";

export default class UserService {
  private static db = prismaClient;

  // #ToDo add skill in filter
  static async queryUsers({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryUsersArgs): Promise<GqlUsersConnection> {
    const take = first ?? 10;
    const where: Prisma.UserWhereInput = {
      AND: [
        filter?.agendaId
          ? { agendas: { some: { agendaId: filter?.agendaId } } }
          : {},
        filter?.keyword
          ? {
              OR: [
                { bio: { contains: filter?.keyword } },
                { lastName: { contains: filter?.keyword } },
                { middleName: { contains: filter?.keyword } },
                { firstName: { contains: filter?.keyword } },
              ],
            }
          : {},
      ],
    };
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc,
    };

    const data = await this.db.user.findMany({
      where,
      orderBy,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const hasNextPage = data.length > take;
    const formattedData = data.slice(0, take).map((record) => ({
      ...record,
    }));
    return {
      totalCount: data.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: formattedData[0]?.id,
        endCursor: formattedData.length
          ? formattedData[formattedData.length - 1].id
          : undefined,
      },
      edges: formattedData.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static async getUser({ id }: GqlQueryUserArgs): Promise<GqlUser | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  static async createUser({
    content,
  }: GqlMutationCreateUserArgs): Promise<GqlUser> {
    const { organizationIds, agendaIds, cityCodes, ...properties } = content;
    const data: Prisma.UserCreateInput = {
      ...properties,
      organizations: {
        create: organizationIds?.map((organizationId) => ({ organizationId })),
      },
      agendas: {
        create: agendaIds?.map((agendaId) => ({ agendaId })),
      },
      cities: {
        create: cityCodes?.map((cityCode) => ({ cityCode })),
      },
    };
    return this.db.user.create({ data });
  }

  static async deleteUser({ id }: GqlMutationDeleteUserArgs): Promise<GqlUser> {
    return this.db.user.delete({ where: { id } });
  }

  static async updateUserProfile({
    id,
    input,
  }: GqlMutationUpdateUserProfileArgs): Promise<GqlUpdateUserProfilePayload> {
    const user = await this.db.user.update({
      where: { id },
      data: input,
    });

    return {
      user: user,
    };
  }

  static async updateUserPrivacy({
    id,
    input,
  }: GqlMutationUpdateUserPrivacyArgs): Promise<GqlUpdateUserPrivacyPayload> {
    const user = await this.db.user.update({
      where: { id },
      data: input,
    });

    return {
      user: user,
    };
  }

  static async addGroupToUser({
    id,
    input,
  }: GqlMutationAddGroupToUserArgs): Promise<GqlAddGroupToUserPayload> {
    const [user, group] = await this.db.$transaction([
      this.db.user.update({
        where: { id },
        data: {
          groups: {
            connectOrCreate: [
              {
                create: {
                  groupId: input.groupId,
                },
                where: {
                  userId_groupId: {
                    userId: id,
                    groupId: input.groupId,
                  },
                },
              },
            ],
          },
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
      user: user,
      group: group,
    };
  }

  static async removeGroupFromUser({
    id,
    input,
  }: GqlMutationRemoveGroupFromUserArgs): Promise<GqlRemoveGroupFromUserPayload> {
    const [user, group] = await this.db.$transaction([
      this.db.user.update({
        where: { id },
        data: {
          groups: {
            disconnect: {
              userId_groupId: {
                userId: id,
                groupId: input.groupId,
              },
            },
          },
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
      user: user,
      group: group,
    };
  }

  static async addOrganizationToUser({
    id,
    input,
  }: GqlMutationAddOrganizationToUserArgs): Promise<GqlAddOrganizationToUserPayload> {
    const [user, organization] = await this.db.$transaction([
      this.db.user.update({
        where: { id },
        data: {
          organizations: {
            connectOrCreate: [
              {
                create: {
                  organizationId: input.organizationId,
                },
                where: {
                  userId_organizationId: {
                    userId: id,
                    organizationId: input.organizationId,
                  },
                },
              },
            ],
          },
        },
      }),
      this.db.organization.findUnique({
        where: { id: input.organizationId },
        include: {
          city: {
            include: {
              state: true,
            },
          },
          state: true,
        },
      }),
    ]);

    if (!organization) {
      throw new Error(`Organization with ID ${input.organizationId} not found`);
    }

    return {
      user: user,
      organization: organization,
    };
  }

  static async removeOrganizationFromUser({
    id,
    input,
  }: GqlMutationRemoveOrganizationFromUserArgs): Promise<GqlRemoveOrganizationFromUserPayload> {
    const [user, organization] = await this.db.$transaction([
      this.db.user.update({
        where: { id },
        data: {
          organizations: {
            disconnect: {
              userId_organizationId: {
                userId: id,
                organizationId: input.organizationId,
              },
            },
          },
        },
      }),
      this.db.organization.findUnique({
        where: { id: input.organizationId },
        include: {
          city: {
            include: {
              state: true,
            },
          },
          state: true,
        },
      }),
    ]);

    if (!organization) {
      throw new Error(`Organization with ID ${input.organizationId} not found`);
    }

    return {
      user: user,
      organization: organization,
    };
  }

  static async addActivityToUser({
    id,
    input,
  }: GqlMutationAddActivityToUserArgs): Promise<GqlAddActivityToUserPayload> {
    const [user, activity] = await this.db.$transaction([
      this.db.user.update({
        where: { id },
        data: {
          activities: {
            connect: {
              id: input.activityId,
            },
          },
        },
      }),
      this.db.activity.findUnique({
        where: { id: input.activityId },
        include: {
          user: true,
          event: {
            include: {
              stat: { select: { totalMinutes: true } },
            },
          },
          stat: { select: { totalMinutes: true } },
        },
      }),
    ]);

    if (!activity) {
      throw new Error(`Activity with ID ${input.activityId} not found`);
    }

    return {
      user: user,
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event.stat?.totalMinutes ?? 0,
        },
      },
    };
  }

  static async removeActivityFromUser({
    id,
    input,
  }: GqlMutationRemoveActivityFromUserArgs): Promise<GqlRemoveActivityFromUserPayload> {
    const [user, activity] = await this.db.$transaction([
      this.db.user.update({
        where: { id },
        data: {
          activities: {
            disconnect: {
              id: input.activityId,
            },
          },
        },
      }),
      this.db.activity.findUnique({
        where: { id: input.activityId },
        include: {
          user: true,
          event: {
            include: {
              stat: { select: { totalMinutes: true } },
            },
          },
          stat: { select: { totalMinutes: true } },
        },
      }),
    ]);

    if (!activity) {
      throw new Error(`Activity with ID ${input.activityId} not found`);
    }

    return {
      user: user,
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event.stat?.totalMinutes ?? 0,
        },
      },
    };
  }
}
