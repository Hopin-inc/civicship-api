import { prismaClient } from "@/prisma/client";
import {
  GqlGroupsConnection,
  GqlGroup,
  GqlMutationCreateGroupArgs,
  GqlMutationDeleteGroupArgs,
  GqlQueryGroupsArgs,
  GqlQueryGroupArgs,
  GqlRemoveChildGroupFromParentPayload,
  GqlMutationAddUserToGroupArgs,
  GqlAddUserToGroupPayload,
  GqlMutationRemoveUserFromGroupArgs,
  GqlRemoveUserFromGroupPayload,
  GqlMutationAddEventOfGroupArgs,
  GqlAddEventOfGroupPayload,
  GqlMutationRemoveEventFromGroupArgs,
  GqlRemoveEventFromGroupPayload,
  GqlMutationAddTargetToGroupArgs,
  GqlAddTargetToGroupPayload,
  GqlMutationRemoveTargetFromGroupArgs,
  GqlRemoveTargetFromGroupPayload,
  GqlMutationAddParentGroupToGroupArgs,
  GqlAddParentGroupToGroupPayload,
  GqlMutationRemoveParentGroupFromParentArgs,
  GqlRemoveParentGroupFromParentPayload,
  GqlMutationAddChildGroupToGroupArgs,
  GqlAddChildGroupToGroupPayload,
  GqlMutationRemoveChildGroupFromParentArgs,
  GqlMutationUpdateGroupInfoArgs,
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

  static async createGroup({
    content,
  }: GqlMutationCreateGroupArgs): Promise<GqlGroup> {
    const { userIds, agendaIds, parentId, organizationId, ...properties } =
      content;

    const data: Prisma.GroupCreateInput = {
      ...properties,
      users: {
        create: userIds?.map((userId) => ({ userId })),
      },
      agendas: {
        create: agendaIds?.map((agendaId) => ({ agendaId })),
      },
      parent: {
        connect: { id: parentId },
      },
      organization: {
        connect: { id: organizationId },
      },
    };

    return this.db.group.create({
      data,
    });
  }

  static async deleteGroup({
    id,
  }: GqlMutationDeleteGroupArgs): Promise<GqlGroup> {
    return this.db.group.delete({
      where: { id },
    });
  }

  static async updateGroupInfo({
    id,
    content,
  }: GqlMutationUpdateGroupInfoArgs): Promise<GqlGroup> {
    return this.db.group.update({
      where: { id },
      data: content,
    });
  }

  static async addUserToGroup({
    id,
    content,
  }: GqlMutationAddUserToGroupArgs): Promise<GqlAddUserToGroupPayload> {
    const [group, user] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          users: {
            connect: {
              userId_groupId: {
                userId: content.userId,
                groupId: id,
              },
            },
          },
        },
      }),
      this.db.user.findUnique({
        where: { id: content.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${content.userId} not found`);
    }

    return { group, user };
  }

  static async removeUserFromGroup({
    id,
    content,
  }: GqlMutationRemoveUserFromGroupArgs): Promise<GqlRemoveUserFromGroupPayload> {
    const [group, user] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          users: {
            disconnect: {
              userId_groupId: {
                userId: content.userId,
                groupId: id,
              },
            },
          },
        },
      }),
      this.db.user.findUnique({
        where: { id: content.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${content.userId} not found`);
    }

    return { group, user };
  }

  static async addEventOfGroup({
    id,
    content,
  }: GqlMutationAddEventOfGroupArgs): Promise<GqlAddEventOfGroupPayload> {
    const [group, event] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          events: {
            connect: {
              groupId_eventId: {
                groupId: id,
                eventId: content.eventId,
              },
            },
          },
        },
      }),
      this.db.event.findUnique({
        where: { id: content.eventId },
        include: {
          stat: { select: { totalMinutes: true } },
        },
      }),
    ]);

    if (!event) {
      throw new Error(`Event with ID ${content.eventId} not found`);
    }

    return {
      group: group,
      event: {
        ...event,
        totalMinutes: event?.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async removeEventFromGroup({
    id,
    content,
  }: GqlMutationRemoveEventFromGroupArgs): Promise<GqlRemoveEventFromGroupPayload> {
    const [group, event] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          events: {
            disconnect: {
              groupId_eventId: {
                groupId: id,
                eventId: content.eventId,
              },
            },
          },
        },
      }),
      this.db.event.findUnique({
        where: { id: content.eventId },
        include: {
          stat: { select: { totalMinutes: true } },
        },
      }),
    ]);

    if (!event) {
      throw new Error(`Event with ID ${content.eventId} not found`);
    }

    return {
      group: group,
      event: {
        ...event,
        totalMinutes: event?.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async addTargetToGroup({
    id,
    content,
  }: GqlMutationAddTargetToGroupArgs): Promise<GqlAddTargetToGroupPayload> {
    const [group, target] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          targets: {
            connect: { id: content.targetId },
          },
        },
      }),
      this.db.target.findUnique({
        where: { id: content.targetId },
      }),
    ]);

    if (!target) {
      throw new Error(`Target with ID ${content.targetId} not found`);
    }

    return { group, target };
  }

  static async removeTargetFromGroup({
    id,
    content,
  }: GqlMutationRemoveTargetFromGroupArgs): Promise<GqlRemoveTargetFromGroupPayload> {
    const [group, target] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          targets: {
            disconnect: { id: content.targetId },
          },
        },
      }),
      this.db.target.findUnique({
        where: { id: content.targetId },
      }),
    ]);

    if (!target) {
      throw new Error(`Target with ID ${content.targetId} not found`);
    }

    return { group, target };
  }

  static async addParentGroupToGroup({
    id,
    content,
  }: GqlMutationAddParentGroupToGroupArgs): Promise<GqlAddParentGroupToGroupPayload> {
    const [group, parent] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          parent: {
            connect: { id: content.parentId },
          },
        },
      }),
      this.db.group.findUnique({
        where: { id: content.parentId },
      }),
    ]);

    if (!parent) {
      throw new Error(`Parent group with ID ${content.parentId} not found`);
    }

    return { group, parent };
  }

  static async removeParentGroupFromParent({
    id,
    content,
  }: GqlMutationRemoveParentGroupFromParentArgs): Promise<GqlRemoveParentGroupFromParentPayload> {
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
        where: { id: content.parentId },
      }),
    ]);

    if (!parent) {
      throw new Error(`Parent group with ID ${content.parentId} not found`);
    }

    return { group, parent };
  }

  static async addChildGroupToGroup({
    id,
    content,
  }: GqlMutationAddChildGroupToGroupArgs): Promise<GqlAddChildGroupToGroupPayload> {
    const [group, child] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          children: {
            connect: { id: content.childId },
          },
        },
      }),
      this.db.group.findUnique({
        where: { id: content.childId },
      }),
    ]);

    if (!child) {
      throw new Error(`Child group with ID ${content.childId} not found`);
    }

    return { group, child };
  }

  static async removeChildGroupFromParent({
    id,
    content,
  }: GqlMutationRemoveChildGroupFromParentArgs): Promise<GqlRemoveChildGroupFromParentPayload> {
    const [group, child] = await this.db.$transaction([
      this.db.group.update({
        where: { id },
        data: {
          children: {
            disconnect: { id: content.childId },
          },
        },
      }),
      this.db.group.findUnique({
        where: { id: content.childId },
      }),
    ]);

    if (!child) {
      throw new Error(`Child group with ID ${content.childId} not found`);
    }

    return { group, child };
  }
}
