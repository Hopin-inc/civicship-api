import { prismaClient } from "@/prisma/client";
import {
  GqlQueryApplicationsArgs,
  GqlQueryApplicationArgs,
  GqlMutationApplicationCreateArgs,
  GqlMutationApplicationDeleteArgs,
  GqlMutationApplicationUpdateArgs,
  GqlMutationApplicationPublishArgs,
  GqlMutationApplicationUnpublishArgs,
  GqlApplicationCreatePayload,
  GqlApplicationDeletePayload,
  GqlApplicationUpdatePayload,
  GqlApplicationUpdatePrivacyPayload,
  GqlApplicationsConnection,
  GqlApplication,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class ApplicationService {
  private static db = prismaClient;

  static async queryApplications({
    filter,
    sort,
    cursor,
    first,
  }: GqlQueryApplicationsArgs): Promise<GqlApplicationsConnection> {
    const take = first ?? 10;

    const where: Prisma.ApplicationWhereInput = {
      AND: [
        filter?.keyword
          ? {
              OR: [{ comment: { contains: filter?.keyword } }],
            }
          : {},
      ],
    };

    const orderBy: Prisma.ApplicationOrderByWithRelationInput[] = [
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
    ];

    const data = await this.db.application.findMany({
      where,
      orderBy,
      include: {
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        user: true,
      },
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasNextPage = data.length > take;
    const formattedData = data.slice(0, take).map((application) => ({
      ...application,
      event: {
        ...application.event!,
        totalMinutes: application.event?.stat?.totalMinutes ?? 0,
      },
    }));

    return {
      totalCount: data.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: Boolean(cursor),
        startCursor: formattedData[0]?.id,
        endCursor: formattedData.length
          ? formattedData[formattedData.length - 1].id
          : undefined,
      },
      edges: formattedData.map((edge) => ({
        cursor: edge.id,
        node: edge as GqlApplication,
      })),
    };
  }

  static async getApplication({
    id,
  }: GqlQueryApplicationArgs): Promise<GqlApplication | null> {
    const application = await this.db.application.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        user: true,
      },
    });

    if (!application || !application.event || !application.user) {
      return null;
    }

    return {
      ...application,
      event: {
        ...application.event,
        totalMinutes: application.event.stat?.totalMinutes ?? 0,
      },
      user: application.user,
    };
  }

  static async applicationCreate({
    input,
  }: GqlMutationApplicationCreateArgs): Promise<GqlApplicationCreatePayload> {
    const { eventId, userId, ...properties } = input;

    const application = await this.db.application.create({
      data: {
        ...properties,
        event: { connect: { id: eventId } },
        user: { connect: { id: userId } },
        activities: properties.activities
          ? {
              create: properties.activities.map((activity) => ({
                ...activity,
              })),
            }
          : undefined,
        submittedAt: new Date(
          properties.submittedAt ?? Date.now(),
        ).toISOString(),
      },
      include: {
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        user: true,
      },
    });

    if (!application.event) {
      throw new Error("Event cannot be null");
    }
    if (!application.user) {
      throw new Error("User cannot be null");
    }

    return {
      application: {
        ...application,
        event: {
          ...application.event,
          totalMinutes: application.event.stat?.totalMinutes ?? 0,
        },
        user: {
          ...application.user,
        },
      },
    };
  }

  static async applicationDelete({
    id,
  }: GqlMutationApplicationDeleteArgs): Promise<GqlApplicationDeletePayload> {
    await this.db.application.delete({
      where: { id },
    });

    return { applicationId: id };
  }

  static async applicationUpdate({
    id,
    input,
  }: GqlMutationApplicationUpdateArgs): Promise<GqlApplicationUpdatePayload> {
    const application = await this.db.application.update({
      where: { id },
      data: input,
      include: {
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        user: true,
      },
    });

    return {
      application: {
        ...application,
        event: {
          ...application.event,
          totalMinutes: application.event.stat?.totalMinutes ?? 0,
        },
        user: application.userId,
      },
    };
  }

  static async applicationPublish({
    id,
    input,
  }: GqlMutationApplicationPublishArgs): Promise<GqlApplicationUpdatePrivacyPayload> {
    const application = await this.db.application.update({
      where: { id },
      data: { isPublic: input.isPublic },
      include: {
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        user: true,
      },
    });

    if (!application.event || !application.user) {
      return null;
    }

    return {
      application: {
        ...application,
        event: {
          ...application.event,
          totalMinutes: application.event.stat?.totalMinutes ?? 0,
        },
      },
    };
  }

  static async applicationUnpublish({
    id,
    input,
  }: GqlMutationApplicationUnpublishArgs): Promise<GqlApplicationUpdatePrivacyPayload> {
    const application = await this.db.application.update({
      where: { id },
      data: { isPublic: input.isPublic },
      include: {
        event: {
          include: {
            stat: { select: { totalMinutes: true } },
          },
        },
        user: true,
      },
    });

    if (!application.event || !application.user) {
      return null;
    }

    return {
      application: {
        ...application,
        event: {
          ...application.event,
          totalMinutes: application.event.stat?.totalMinutes ?? 0,
        },
      },
    };
  }
}
