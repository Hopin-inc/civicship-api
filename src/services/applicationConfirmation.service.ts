import { prismaClient } from "@/prisma/client";
import {
  GqlApplicationConfirmationCreatePayload,
  GqlQueryApplicationConfirmationsArgs,
  GqlQueryApplicationConfirmationArgs,
  GqlMutationApplicationConfirmationCreateArgs,
  GqlApplicationConfirmationsConnection,
  GqlApplicationConfirmation,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";

export default class ApplicationConfirmationService {
  private static db = prismaClient;

  static async queryApplicationConfirmations({
    filter,
    sort,
    cursor,
    first,
  }: GqlQueryApplicationConfirmationsArgs): Promise<GqlApplicationConfirmationsConnection> {
    const take = first ?? 10;

    const where: Prisma.ApplicationConfirmationWhereInput = {
      AND: [
        filter?.keyword
          ? {
              OR: [{ comment: { contains: filter?.keyword } }],
            }
          : {},
      ],
    };

    const orderBy: Prisma.ApplicationConfirmationOrderByWithRelationInput[] = [
      { createdAt: sort?.createdAt ?? Prisma.SortOrder.desc },
    ];

    const data = await this.db.applicationConfirmation.findMany({
      where,
      orderBy,
      include: {
        application: {
          include: {
            event: {
              include: {
                stat: { select: { totalMinutes: true } },
              },
            },
            user: true,
          },
        },
        confirmedBy: true,
      },
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasNextPage = data.length > take;
    const formattedData = data.slice(0, take).map((confirmation) => ({
      ...confirmation,
      application: {
        ...confirmation.application,
        event: {
          ...confirmation.application.event!,
          totalMinutes: confirmation.application.event?.stat?.totalMinutes ?? 0,
        },
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
        node: edge as GqlApplicationConfirmation,
      })),
    };
  }

  static async getApplicationConfirmation({
    id,
  }: GqlQueryApplicationConfirmationArgs): Promise<GqlApplicationConfirmation | null> {
    const confirmation = await this.db.applicationConfirmation.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            event: {
              include: {
                stat: { select: { totalMinutes: true } },
              },
            },
            user: true,
          },
        },
        confirmedBy: true,
      },
    });

    return confirmation
      ? ({
          ...confirmation,
          application: {
            ...confirmation.application,
            event: confirmation.application.event
              ? {
                  ...confirmation.application.event,
                  totalMinutes:
                    confirmation.application.event.stat?.totalMinutes ?? 0,
                }
              : null,
          },
        } as GqlApplicationConfirmation)
      : null;
  }

  static async applicationConfirmationCreate({
    input,
  }: GqlMutationApplicationConfirmationCreateArgs): Promise<GqlApplicationConfirmationCreatePayload> {
    const { applicationId, confirmerId, ...properties } = input;

    const confirmation = await this.db.applicationConfirmation.create({
      data: {
        ...properties,
        application: { connect: { id: applicationId } },
        confirmedBy: { connect: { id: confirmerId } },
      },
      include: {
        application: {
          include: {
            event: {
              include: {
                stat: { select: { totalMinutes: true } },
              },
            },
            user: true,
          },
        },
        confirmedBy: true,
      },
    });

    if (!confirmation.application.event)
      throw new Error("Event cannot be null");
    if (!confirmation.application.user) throw new Error("User cannot be null");
    if (!confirmation.confirmedBy)
      throw new Error("ConfirmedBy cannot be null");

    return {
      applicationConfirmation: {
        ...confirmation,
        application: {
          ...confirmation.application,
          event: {
            ...confirmation.application.event,
            totalMinutes:
              confirmation.application.event?.stat?.totalMinutes ?? 0,
          },
          user: {
            ...confirmation.application.user,
          },
        },
        confirmedBy: {
          ...confirmation.confirmedBy,
        },
      },
    };
  }
}
