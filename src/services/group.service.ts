import { prismaClient } from "@/prisma/client";
import {
  GqlGroupsConnection,
  GqlGroup,
  GqlQueryGroupsArgs,
  GqlQueryGroupArgs,
  GqlMutationGroupCreateArgs,
  GqlMutationGroupDeleteArgs,
  GqlMutationGroupUpdateArgs,
  GqlMutationGroupAddUserArgs,
  GqlMutationGroupRemoveUserArgs,
  GqlMutationGroupAddEventArgs,
  GqlMutationGroupRemoveEventArgs,
  GqlMutationGroupAddTargetArgs,
  GqlMutationGroupRemoveTargetArgs,
  GqlMutationGroupAddParentArgs,
  GqlMutationGroupRemoveParentArgs,
  GqlMutationGroupAddChildArgs,
  GqlMutationGroupRemoveChildArgs,
  GqlGroupAddUserPayload,
  GqlGroupRemoveUserPayload,
  GqlGroupAddEventPayload,
  GqlGroupRemoveEventPayload,
  GqlGroupAddTargetPayload,
  GqlGroupRemoveTargetPayload,
  GqlGroupAddParentPayload,
  GqlGroupRemoveParentPayload,
  GqlGroupAddChildPayload,
  GqlGroupRemoveChildPayload,
  GqlGroupCreatePayload,
  GqlGroupDeletePayload,
  GqlGroupUpdatePayload,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class GroupService {
  private static db = prismaClient;

  static async queryGroups({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryGroupsArgs): Promise<GqlGroupsConnection> {
    const take = first ?? 10;
    const where: Prisma.GroupWhereInput = {
      AND: [
        filter?.agendaId
          ? { agendas: { some: { agendaId: filter?.agendaId } } }
          : {},
        filter?.organizationId
          ? { organizationId: filter?.organizationId }
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
    const orderBy: Prisma.GroupOrderByWithRelationInput[] = [
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
      { updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc },
    ];

    const data = await this.db.group.findMany({
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

  static async getGroup({ id }: GqlQueryGroupArgs): Promise<GqlGroup | null> {
    return this.db.group.findUnique({
      where: { id },
      include: {
        parent: true,
        organization: {
          include: {
            city: {
              include: { state: true },
            },
            state: true,
          },
        },
      },
    });
  }

  static async groupCreate({
    input,
  }: GqlMutationGroupCreateArgs): Promise<GqlGroupCreatePayload> {
    const { organizationId, agendaIds, cityCodes, ...properties } = input;

    const data: Prisma.GroupCreateInput = {
      ...properties,
      organization: {
        connect: { id: organizationId },
      },
      agendas: {
        create: agendaIds?.map((agendaId) => ({ agendaId })),
      },
      cities: {
        create: cityCodes?.map((cityCode) => ({ cityCode })),
      },
    };

    const group = await this.db.group.create({
      data,
    });

    return { group };
  }

  static async groupDelete({
    id,
  }: GqlMutationGroupDeleteArgs): Promise<GqlGroupDeletePayload> {
    await this.db.group.delete({
      where: { id },
    });

    return { groupId: id };
  }

  static async groupUpdate({
    id,
    input,
  }: GqlMutationGroupUpdateArgs): Promise<GqlGroupUpdatePayload> {
    const group = await this.db.group.update({
      where: { id },
      data: input,
    });

    return { group };
  }

  static async groupAddUser({
    id,
    input,
  }: GqlMutationGroupAddUserArgs): Promise<GqlGroupAddUserPayload> {
    const [group, user] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          users: {
            connect: {
              userId_groupId: {
                userId: input.userId,
                groupId: id,
              },
            },
          },
        },
      }),
      this.db.user.findUnique({
        where: { id: input.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    return { group, user };
  }

  static async groupRemoveUser({
    id,
    input,
  }: GqlMutationGroupRemoveUserArgs): Promise<GqlGroupRemoveUserPayload> {
    const [group, user] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          users: {
            disconnect: {
              userId_groupId: {
                userId: input.userId,
                groupId: id,
              },
            },
          },
        },
      }),
      this.db.user.findUnique({
        where: { id: input.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    return { group, user };
  }

  static async groupAddEvent({
    id,
    input,
  }: GqlMutationGroupAddEventArgs): Promise<GqlGroupAddEventPayload> {
    const [group, event] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          events: {
            connect: {
              groupId_eventId: {
                groupId: id,
                eventId: input.eventId,
              },
            },
          },
        },
      }),
      this.db.event.findUnique({
        where: { id: input.eventId },
        include: {
          stat: { select: { totalMinutes: true } },
        },
      }),
    ]);

    if (!event) {
      throw new Error(`Event with ID ${input.eventId} not found`);
    }

    return {
      group,
      event: {
        ...event,
        totalMinutes: event?.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async groupRemoveEvent({
    id,
    input,
  }: GqlMutationGroupRemoveEventArgs): Promise<GqlGroupRemoveEventPayload> {
    const [group, event] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          events: {
            disconnect: {
              groupId_eventId: {
                groupId: id,
                eventId: input.eventId,
              },
            },
          },
        },
      }),
      this.db.event.findUnique({
        where: { id: input.eventId },
        include: {
          stat: { select: { totalMinutes: true } },
        },
      }),
    ]);

    if (!event) {
      throw new Error(`Event with ID ${input.eventId} not found`);
    }

    return {
      group,
      event: {
        ...event,
        totalMinutes: event?.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async groupAddTarget({
    id,
    input,
  }: GqlMutationGroupAddTargetArgs): Promise<GqlGroupAddTargetPayload> {
    const [group, target] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          targets: {
            connect: { id: input.targetId },
          },
        },
      }),
      this.db.target.findUnique({
        where: { id: input.targetId },
      }),
    ]);

    if (!target) {
      throw new Error(`Target with ID ${input.targetId} not found`);
    }

    return { group, target };
  }

  static async groupRemoveTarget({
    id,
    input,
  }: GqlMutationGroupRemoveTargetArgs): Promise<GqlGroupRemoveTargetPayload> {
    const [group, target] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          targets: {
            disconnect: { id: input.targetId },
          },
        },
      }),
      this.db.target.findUnique({
        where: { id: input.targetId },
      }),
    ]);

    if (!target) {
      throw new Error(`Target with ID ${input.targetId} not found`);
    }

    return { group, target };
  }

  static async groupAddParent({
    id,
    input,
  }: GqlMutationGroupAddParentArgs): Promise<GqlGroupAddParentPayload> {
    const [group, parent] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          parent: {
            connect: { id: input.parentId },
          },
        },
      }),
      this.db.group.findUnique({
        where: { id: input.parentId },
      }),
    ]);

    if (!parent) {
      throw new Error(`Parent group with ID ${input.parentId} not found`);
    }

    return { group, parent };
  }

  static async groupRemoveParent({
    id,
    input,
  }: GqlMutationGroupRemoveParentArgs): Promise<GqlGroupRemoveParentPayload> {
    const [group, parent] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          parent: {
            disconnect: true,
          },
        },
      }),
      this.db.group.findUnique({
        where: { id: input.parentId },
      }),
    ]);

    if (!parent) {
      throw new Error(`Parent group with ID ${input.parentId} not found`);
    }

    return { group, parent };
  }

  static async groupAddChild({
    id,
    input,
  }: GqlMutationGroupAddChildArgs): Promise<GqlGroupAddChildPayload> {
    const [group, child] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          children: {
            connect: { id: input.childId },
          },
        },
      }),
      this.db.group.findUnique({
        where: { id: input.childId },
      }),
    ]);

    if (!child) {
      throw new Error(`Child group with ID ${input.childId} not found`);
    }

    return { group, child };
  }

  static async groupRemoveChild({
    id,
    input,
  }: GqlMutationGroupRemoveChildArgs): Promise<GqlGroupRemoveChildPayload> {
    const [group, child] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          children: {
            disconnect: { id: input.childId },
          },
        },
      }),
      this.db.group.findUnique({
        where: { id: input.childId },
      }),
    ]);

    if (!child) {
      throw new Error(`Child group with ID ${input.childId} not found`);
    }

    return { group, child };
  }
}
