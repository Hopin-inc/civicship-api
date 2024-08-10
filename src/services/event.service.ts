import { Prisma } from "@prisma/client";
import {
  GqlEvent,
  GqlEventsConnection,
  GqlQueryEventArgs,
  GqlQueryEventsArgs,
  GqlMutationEventCreateArgs,
  GqlMutationEventDeleteArgs,
  GqlMutationEventUpdateArgs,
  GqlMutationEventPublishArgs,
  GqlMutationEventUnpublishArgs,
  GqlMutationEventAddGroupArgs,
  GqlMutationEventRemoveGroupArgs,
  GqlMutationEventAddOrganizationArgs,
  GqlMutationEventRemoveOrganizationArgs,
  GqlEventCreatePayload,
  GqlEventDeletePayload,
  GqlEventUpdatePayload,
  GqlEventUpdatePrivacyPayload,
  GqlEventAddGroupPayload,
  GqlEventRemoveGroupPayload,
  GqlEventAddOrganizationPayload,
  GqlEventRemoveOrganizationPayload,
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";

export default class EventService {
  private static db = prismaClient;

  static async queryEvents({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryEventsArgs): Promise<GqlEventsConnection> {
    const take = first ?? 10;
    const where: Prisma.EventWhereInput = {
      AND: [
        filter?.agendaId
          ? { agendas: { some: { agendaId: filter?.agendaId } } }
          : {},
        filter?.cityCode
          ? { cities: { some: { cityCode: filter?.cityCode } } }
          : {},
        filter?.keyword
          ? {
              OR: [
                { description: { contains: filter?.keyword } },
                {
                  organizations: {
                    some: {
                      organization: { name: { contains: filter?.keyword } },
                    },
                  },
                },
              ],
            }
          : {},
      ],
    };
    const orderBy: Prisma.EventOrderByWithRelationInput = {
      startsAt: sort?.startsAt ?? Prisma.SortOrder.desc,
    };

    const data = await this.db.event.findMany({
      where,
      orderBy,
      include: {
        agendas: { include: { agenda: true } },
        stat: { select: { totalMinutes: true } },
      },
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const hasNextPage = data.length > take;
    const formattedData: GqlEvent[] = data.slice(0, take).map((record) => ({
      ...record,
      totalMinutes: record.stat?.totalMinutes ?? 0,
      agendas: record.agendas.map((r) => r.agenda),
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

  static async getEvent({ id }: GqlQueryEventArgs): Promise<GqlEvent | null> {
    const event = await this.db.event.findUnique({
      where: { id },
      include: {
        agendas: { include: { agenda: true } },
        stat: { select: { totalMinutes: true } },
      },
    });
    return event
      ? {
          ...event,
          agendas: event.agendas.map((r) => r.agenda),
          totalMinutes: event.stat?.totalMinutes ?? 0,
        }
      : null;
  }

  static async eventCreate({
    input,
  }: GqlMutationEventCreateArgs): Promise<GqlEventCreatePayload> {
    const { agendaIds, cityCodes, ...properties } = input;
    const data: Prisma.EventCreateInput = {
      ...properties,
      agendas: {
        create: agendaIds?.map((agendaId) => ({ agendaId })),
      },
      cities: {
        create: cityCodes?.map((cityCode) => ({ cityCode })),
      },
    };
    const event = await this.db.event.create({
      data,
      include: {
        agendas: { include: { agenda: true } },
        stat: { select: { totalMinutes: true } },
      },
    });
    return {
      event: {
        ...event,
        agendas: event.agendas.map((r) => r.agenda),
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async eventDelete({
    id,
  }: GqlMutationEventDeleteArgs): Promise<GqlEventDeletePayload> {
    await this.db.event.delete({
      where: { id },
      include: {
        agendas: { include: { agenda: true } },
        stat: { select: { totalMinutes: true } },
      },
    });
    return { eventId: id };
  }

  static async eventUpdate({
    id,
    input,
  }: GqlMutationEventUpdateArgs): Promise<GqlEventUpdatePayload> {
    const event = await this.db.event.update({
      where: { id },
      data: input,
      include: {
        agendas: { include: { agenda: true } },
        stat: { select: { totalMinutes: true } },
      },
    });
    return {
      event: {
        ...event,
        agendas: event.agendas.map((r) => r.agenda),
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async eventPublish({
    id,
    input,
  }: GqlMutationEventPublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    const event = await this.db.event.update({
      where: { id },
      data: input,
      include: {
        agendas: { include: { agenda: true } },
        stat: { select: { totalMinutes: true } },
      },
    });
    return {
      event: {
        ...event,
        agendas: event.agendas.map((r) => r.agenda),
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async eventUnpublish({
    id,
    input,
  }: GqlMutationEventUnpublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    const event = await this.db.event.update({
      where: { id },
      data: input,
      include: {
        agendas: { include: { agenda: true } },
        stat: { select: { totalMinutes: true } },
      },
    });
    return {
      event: {
        ...event,
        agendas: event.agendas.map((r) => r.agenda),
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async eventAddGroup({
    id,
    input,
  }: GqlMutationEventAddGroupArgs): Promise<GqlEventAddGroupPayload> {
    const [event, group] = await this.db.$transaction([
      this.db.event.update({
        where: { id },
        data: {
          groups: {
            connect: {
              groupId_eventId: {
                eventId: id,
                groupId: input.groupId,
              },
            },
          },
        },
        include: {
          agendas: { include: { agenda: true } },
          stat: { select: { totalMinutes: true } },
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
      event: {
        ...event,
        agendas: event.agendas.map((r) => r.agenda),
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
      group,
    };
  }

  static async eventRemoveGroup({
    id,
    input,
  }: GqlMutationEventRemoveGroupArgs): Promise<GqlEventRemoveGroupPayload> {
    const [event, group] = await this.db.$transaction([
      this.db.event.update({
        where: { id },
        data: {
          groups: {
            disconnect: {
              groupId_eventId: {
                eventId: id,
                groupId: input.groupId,
              },
            },
          },
        },
        include: {
          agendas: { include: { agenda: true } },
          stat: { select: { totalMinutes: true } },
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
      event: {
        ...event,
        agendas: event.agendas.map((r) => r.agenda),
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
      group,
    };
  }

  static async eventAddOrganization({
    id,
    input,
  }: GqlMutationEventAddOrganizationArgs): Promise<GqlEventAddOrganizationPayload> {
    const [event, organization] = await this.db.$transaction([
      this.db.event.update({
        where: { id },
        data: {
          organizations: {
            connect: {
              organizationId_eventId: {
                eventId: id,
                organizationId: input.organizationId,
              },
            },
          },
        },
        include: {
          agendas: { include: { agenda: true } },
          stat: { select: { totalMinutes: true } },
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
      event: {
        ...event,
        agendas: event.agendas.map((r) => r.agenda),
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
      organization,
    };
  }

  static async eventRemoveOrganization({
    id,
    input,
  }: GqlMutationEventRemoveOrganizationArgs): Promise<GqlEventRemoveOrganizationPayload> {
    const [event, organization] = await this.db.$transaction([
      this.db.event.update({
        where: { id },
        data: {
          organizations: {
            disconnect: {
              organizationId_eventId: {
                eventId: id,
                organizationId: input.organizationId,
              },
            },
          },
        },
        include: {
          agendas: { include: { agenda: true } },
          stat: { select: { totalMinutes: true } },
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
      event: {
        ...event,
        agendas: event.agendas.map((r) => r.agenda),
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
      organization,
    };
  }
}
