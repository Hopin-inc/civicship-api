import { prismaClient } from "@/prisma/client";
import {
  GqlActivitiesConnection,
  GqlActivity,
  GqlAddEventToActivityPayload,
  GqlAddUserToActivityPayload,
  GqlMutationAddEventToActivityArgs,
  GqlMutationAddUserToActivityArgs,
  GqlMutationCreateActivityArgs,
  GqlMutationDeleteActivityArgs,
  GqlMutationRemoveEventFromActivityArgs,
  GqlMutationUpdateActivityInfoArgs,
  GqlMutationUpdateActivityPrivacyArgs,
  GqlMutationUpdateUserOfActivityArgs,
  GqlQueryActivitiesArgs,
  GqlQueryActivityArgs,
  GqlRemoveEventFromActivityPayload,
  GqlUpdateActivityInfoPayload,
  GqlUpdateActivityPrivacyPayload,
  GqlUpdateUserOfActivityPayload,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class ActivityService {
  private static db = prismaClient;

  static async queryActivities({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryActivitiesArgs): Promise<GqlActivitiesConnection> {
    const take = first ?? 10;
    const where: Prisma.ActivityWhereInput = {
      AND: [
        filter?.userId ? { userId: filter?.userId } : {},
        filter?.eventId ? { eventId: filter?.eventId } : {},
        filter?.keyword
          ? {
              OR: [
                { description: { contains: filter?.keyword } },
                { remark: { contains: filter?.keyword } },
              ],
            }
          : {},
      ],
    };
    const orderBy: Prisma.ActivityOrderByWithRelationInput[] = [
      { startsAt: sort?.startsAt ?? Prisma.SortOrder.desc },
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
    ];

    const data = await this.db.activity.findMany({
      where,
      orderBy,
      include: {
        user: true,
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        stat: { select: { totalMinutes: true } },
      },
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const hasNextPage = data.length > take;
    const formattedData = data.slice(0, take).map((record) => {
      if (!record.event) {
        throw new Error(`Activity with ID ${record.id} has no corresponding event`);
      }
      return {
        ...record,
        event: {
          ...record.event,
          totalMinutes: record.event?.stat?.totalMinutes ?? 0,
        },
        totalMinutes: record.stat?.totalMinutes ?? 0,
      };
    });
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

  static async getActivity({
    id,
  }: GqlQueryActivityArgs): Promise<GqlActivity | null> {
    const activity = await this.db.activity.findUnique({
      where: { id },
      include: {
        user: true,
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        stat: { select: { totalMinutes: true } },
      },
    });

    return activity && activity.event
      ? {
          ...activity,
          totalMinutes: activity.stat?.totalMinutes ?? 0,
          event: {
            ...activity.event,
            createdAt: activity.createdAt,
            totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
          },
        }
      : null;
  }

  static async createActivity({
    content,
  }: GqlMutationCreateActivityArgs): Promise<GqlActivity> {
    const { userId, eventId, ...properties } = content;
    const activity = await this.db.activity.create({
      data: {
        ...properties,
        user: {
          connect: { id: userId },
        },
        event: {
          connect: { id: eventId },
        },
      },
      include: {
        user: true,
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        stat: { select: { totalMinutes: true } },
      },
    });
    if (!activity.event) {
      throw new Error(`Activity with ID ${activity.id} has no corresponding event`);
    }

    return {
      ...activity,
      totalMinutes: activity.stat?.totalMinutes ?? 0,
      event: {
        ...activity.event,
        totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async deleteActivity({
    id,
  }: GqlMutationDeleteActivityArgs): Promise<GqlActivity> {
    const activity = await this.db.activity.delete({
      where: { id },
      include: {
        user: true,
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        stat: { select: { totalMinutes: true } },
      },
    });

    return {
      ...activity,
      totalMinutes: activity.stat?.totalMinutes ?? 0,
      event: {
        ...activity.event,
        totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async updateActivityInfo({
    id,
    content,
  }: GqlMutationUpdateActivityInfoArgs): Promise<GqlUpdateActivityInfoPayload> {
    const activity = await this.db.activity.update({
      where: { id },
      data: content,
      include: {
        user: true,
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        stat: { select: { totalMinutes: true } },
      },
    });

    return {
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

  static async updateActivityPrivacy({
    id,
    content,
  }: GqlMutationUpdateActivityPrivacyArgs): Promise<GqlUpdateActivityPrivacyPayload> {
    const activity = await this.db.activity.update({
      where: { id },
      data: content,
      include: {
        user: true,
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        stat: { select: { totalMinutes: true } },
      },
    });
    if (!activity.event) {
      throw new Error(`Activity with ID ${activity.id} has no corresponding event`);
    }

    return {
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

  static async addUserToActivity({
    id,
    content,
  }: GqlMutationAddUserToActivityArgs): Promise<GqlAddUserToActivityPayload> {
    const [activity, user] = await this.db.$transaction([
      this.db.activity.update({
        where: { id },
        data: {
          user: {
            connect: {
              id: content.userId,
            },
          },
        },
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
      this.db.user.findUnique({
        where: { id: content.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${content.userId} not found`);
    }

    return {
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
        },
      },
      user: user,
    };
  }

  static async updateUserOfActivity({
    id,
    content,
  }: GqlMutationUpdateUserOfActivityArgs): Promise<GqlUpdateUserOfActivityPayload> {
    const [activity, user] = await this.db.$transaction([
      this.db.activity.update({
        where: { id },
        data: {
          user: {
            update: {
              id: content.userId,
            },
          },
        },
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
      this.db.user.findUnique({
        where: { id: content.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${content.userId} not found`);
    }

    return {
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
        },
      },
      user: user,
    };
  }

  static async addEventToActivity({
    id,
    content,
  }: GqlMutationAddEventToActivityArgs): Promise<GqlAddEventToActivityPayload> {
    const [activity, event] = await this.db.$transaction([
      this.db.activity.update({
        where: { id },
        data: {
          event: {
            connect: {
              id: content.eventId,
            },
          },
        },
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
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
        },
      },
      event: {
        ...event,
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async removeEventFromActivity({
    id,
    content,
  }: GqlMutationRemoveEventFromActivityArgs): Promise<GqlRemoveEventFromActivityPayload> {
    const [activity, event] = await this.db.$transaction([
      this.db.activity.update({
        where: { id },
        data: {
          event: {
            disconnect: {
              id: content.eventId,
            },
          },
        },
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
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
        },
      },
      event: {
        ...event,
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
    };
  }
}
