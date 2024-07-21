import { prismaClient } from "@/prisma/client";
import {
  GqlActivitiesConnection,
  GqlActivity,
  GqlMutationCreateActivityArgs,
  GqlMutationDeleteActivityArgs,
  GqlMutationUpdateActivityArgs,
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
        event: true,
      },
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

  static async getActivity({
    id,
  }: GqlQueryActivityArgs): Promise<GqlActivity | null> {
    return this.db.activity.findUnique({
      where: { id },
      include: {
        user: true,
        event: true,
      },
    });
  }

  static async createActivity({
    content,
  }: GqlMutationCreateActivityArgs): Promise<GqlActivity> {
    const { userId, eventId, ...properties } = content;
    const data: Prisma.ActivityCreateInput = {
      ...properties,
      user: {
        connect: { id: userId },
      },
      event: {
        connect: { id: eventId },
      },
    };

    return this.db.activity.create({
      data,
      include: {
        user: true,
        event: true,
      },
    });
  }

  static async updateActivity({
    id,
    content,
  }: GqlMutationUpdateActivityArgs): Promise<GqlActivity> {
    return this.db.activity.update({
      where: { id },
      data: content,
      include: {
        user: true,
        event: true,
      },
    });
  }

  static async deleteActivity({
    id,
  }: GqlMutationDeleteActivityArgs): Promise<GqlActivity> {
    return this.db.activity.delete({
      where: { id },
      include: {
        user: true,
        event: true,
      },
    });
  }
}
