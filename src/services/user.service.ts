import {
  GqlQueryUserArgs,
  GqlQueryUsersArgs,
  GqlUser,
  GqlUsersConnection,
  GqlEvent,
  GqlMutationUserCreateArgs,
  GqlUserCreatePayload,
  GqlMutationUserUpdateArgs,
  GqlUserUpdatePayload,
  GqlMutationUserPublishArgs,
  GqlUserUpdatePrivacyPayload,
  GqlUserRemoveGroupPayload,
  GqlMutationUserRemoveGroupArgs,
  GqlMutationUserAddOrganizationArgs,
  GqlUserAddOrganizationPayload,
  GqlMutationUserRemoveOrganizationArgs,
  GqlUserRemoveOrganizationPayload,
  GqlMutationUserAddActivityArgs,
  GqlUserAddActivityPayload,
  GqlUserRemoveActivityPayload,
  GqlMutationUserRemoveActivityArgs,
  GqlUserAddGroupPayload,
  GqlUserDeletePayload,
  GqlMutationUserDeleteArgs,
  GqlMutationUserAddGroupArgs,
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

  static async userCreate({
    input,
  }: GqlMutationUserCreateArgs): Promise<GqlUserCreatePayload> {
    const { agendaIds, cityCodes, ...properties } = input;
    const data: Prisma.UserCreateInput = {
      ...properties,
      agendas: {
        create: agendaIds?.map((agendaId) => ({ agendaId })),
      },
      cities: {
        create: cityCodes?.map((cityCode) => ({ cityCode })),
      },
    };
    const user: GqlUser = await this.db.user.create({ data });
    return { user: user };
  }

  static async userDelete({
    id,
  }: GqlMutationUserDeleteArgs): Promise<GqlUserDeletePayload> {
    this.db.user.delete({ where: { id } });
    return { userId: id };
  }

  static async userUpdate({
    id,
    input,
  }: GqlMutationUserUpdateArgs): Promise<GqlUserUpdatePayload> {
    const user = await this.db.user.update({
      where: { id },
      data: input,
    });

    return {
      user: user,
    };
  }

  static async userPublish({
    id,
    input,
  }: GqlMutationUserPublishArgs): Promise<GqlUserUpdatePrivacyPayload> {
    const user = await this.db.user.update({
      where: { id },
      data: input,
    });

    return {
      user: user,
    };
  }

  static async userUnpublish({
    id,
    input,
  }: GqlMutationUserPublishArgs): Promise<GqlUserUpdatePrivacyPayload> {
    const user = await this.db.user.update({
      where: { id },
      data: input,
    });

    return {
      user: user,
    };
  }

  static async userAddGroup({
    id,
    input,
  }: GqlMutationUserAddGroupArgs): Promise<GqlUserAddGroupPayload> {
    const [user, group] = await this.db.$transaction([
      this.db.user.update({
        where: { id },
        data: {
          groups: {
            connect: {
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

  static async userRemoveGroup({
    id,
    input,
  }: GqlMutationUserRemoveGroupArgs): Promise<GqlUserRemoveGroupPayload> {
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

  static async userAddOrganization({
    id,
    input,
  }: GqlMutationUserAddOrganizationArgs): Promise<GqlUserAddOrganizationPayload> {
    const [user, organization] = await this.db.$transaction([
      this.db.user.update({
        where: { id },
        data: {
          organizations: {
            connect: {
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

  static async userRemoveOrganization({
    id,
    input,
  }: GqlMutationUserRemoveOrganizationArgs): Promise<GqlUserRemoveOrganizationPayload> {
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

  static async userAddActivity({
    id,
    input,
  }: GqlMutationUserAddActivityArgs): Promise<GqlUserAddActivityPayload> {
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
      throw new Error(`Activity with ID ${content.activityId} not found`);
    } else if (!activity.event) {
      throw new Error(`Activity with ID ${content.activityId} has no corresponding event`);
    }

    return {
      user: user,
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
        },
      },
    };
  }

  static async userRemoveActivity({
    id,
    input,
  }: GqlMutationUserRemoveActivityArgs): Promise<GqlUserRemoveActivityPayload> {
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
      throw new Error(`Activity with ID ${content.activityId} not found`);
    } else if (!activity.event) {
      throw new Error(`Activity with ID ${content.activityId} has no corresponding event`);
    }

    return {
      user: user,
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
        },
      },
    };
  }
}
