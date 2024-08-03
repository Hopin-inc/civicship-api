import { prismaClient } from "@/prisma/client";
import {
  GqlActivitiesConnection,
  GqlActivity,
  GqlMutationCreateActivityArgs,
  GqlMutationDeleteActivityArgs,
  GqlQueryActivitiesArgs,
  GqlQueryActivityArgs,
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

    return {
      ...activity,
      totalMinutes: activity.stat?.totalMinutes ?? 0,
      event: {
        ...activity.event,
        totalMinutes: activity.event?.stat?.totalMinutes ?? 0,
      },
    } as GqlActivity;
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
    } as GqlActivity;
  }
}
