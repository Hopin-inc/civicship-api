import { prismaClient } from "@/prisma/client";
import {
  GqlActivitiesConnection,
  GqlActivity,
  GqlQueryActivitiesArgs,
  GqlQueryActivityArgs,
  GqlActivityAddEventPayload,
  GqlActivityAddUserPayload,
  GqlMutationActivityAddEventArgs,
  GqlMutationActivityAddUserArgs,
  GqlMutationActivityCreateArgs,
  GqlMutationActivityDeleteArgs,
  GqlMutationActivityRemoveEventArgs,
  GqlMutationActivityUpdateArgs,
  GqlMutationActivityPublishArgs,
  GqlMutationActivityUnpublishArgs,
  GqlMutationActivityUpdateUserArgs,
  GqlActivityRemoveEventPayload,
  GqlActivityUpdatePayload,
  GqlActivityUpdateUserPayload,
  GqlActivityCreatePayload,
  GqlActivityDeletePayload,
  GqlActivityUpdatePrivacyPayload,
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
    const formattedData = data.slice(0, take).map((record) => ({
      ...record,
      event: {
        ...record.event,
        totalMinutes: record.event?.stat?.totalMinutes ?? 0,
      },
      totalMinutes: record.stat?.totalMinutes ?? 0,
    })) as GqlActivity[];
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

    return activity
      ? ({
          ...activity,
          totalMinutes: activity.stat?.totalMinutes ?? 0,
          event: {
            ...activity.event,
            totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
          },
        } as GqlActivity)
      : null;
  }

  static async activityCreate({
    input,
  }: GqlMutationActivityCreateArgs): Promise<GqlActivityCreatePayload> {
    const { userId, eventId, ...properties } = input;
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

    return {
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
        },
      } as GqlActivity,
    };
  }

  static async activityDelete({
    id,
  }: GqlMutationActivityDeleteArgs): Promise<GqlActivityDeletePayload> {
    await this.db.activity.delete({
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

    return { activityId: id };
  }

  static async activityUpdate({
    id,
    input,
  }: GqlMutationActivityUpdateArgs): Promise<GqlActivityUpdatePayload> {
    const activity = await this.db.activity.update({
      where: { id },
      data: input,
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
      } as GqlActivity,
    };
  }

  static async activityPublish({
    id,
    input,
  }: GqlMutationActivityPublishArgs): Promise<GqlActivityUpdatePrivacyPayload> {
    const activity = await this.db.activity.update({
      where: { id },
      data: input,
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
      } as GqlActivity,
    };
  }

  static async activityUnpublish({
    id,
    input,
  }: GqlMutationActivityUnpublishArgs): Promise<GqlActivityUpdatePrivacyPayload> {
    const activity = await this.db.activity.update({
      where: { id },
      data: input,
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
      } as GqlActivity,
    };
  }

  static async activityAddUser({
    id,
    input,
  }: GqlMutationActivityAddUserArgs): Promise<GqlActivityAddUserPayload> {
    const [activity, user] = await this.db.$transaction([
      this.db.activity.update({
        where: { id },
        data: {
          user: {
            connect: {
              id: input.userId,
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
        where: { id: input.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    return {
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
        },
      } as GqlActivity,
      user: user,
    };
  }

  static async activityUpdateUser({
    id,
    input,
  }: GqlMutationActivityUpdateUserArgs): Promise<GqlActivityUpdateUserPayload> {
    const [activity, user] = await this.db.$transaction([
      this.db.activity.update({
        where: { id },
        data: {
          user: {
            update: {
              id: input.userId,
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
        where: { id: input.userId },
      }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${input.userId} not found`);
    }

    return {
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
        },
      } as GqlActivity,
      user: user,
    };
  }

  static async activityAddEvent({
    id,
    input,
  }: GqlMutationActivityAddEventArgs): Promise<GqlActivityAddEventPayload> {
    const [activity, event] = await this.db.$transaction([
      this.db.activity.update({
        where: { id },
        data: {
          event: {
            connect: {
              id: input.eventId,
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
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
        },
      } as GqlActivity,
      event: {
        ...event,
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async activityRemoveEvent({
    id,
    input,
  }: GqlMutationActivityRemoveEventArgs): Promise<GqlActivityRemoveEventPayload> {
    const [activity, event] = await this.db.$transaction([
      this.db.activity.update({
        where: { id },
        data: {
          event: {
            disconnect: {
              id: input.eventId,
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
      activity: {
        ...activity,
        totalMinutes: activity.stat?.totalMinutes ?? 0,
        event: {
          ...activity.event,
          totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
        },
      } as GqlActivity,
      event: {
        ...event,
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
    };
  }
}
