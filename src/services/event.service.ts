import { Prisma } from "@prisma/client";
import {
  GqlEvent,
  GqlEventsConnection,
  GqlMutationCreateEventArgs,
  GqlMutationDeleteEventArgs,
  GqlMutationUpdateEventInfoArgs,
  GqlQueryEventArgs,
  GqlQueryEventsArgs,
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

  static async createEvent({
    content,
  }: GqlMutationCreateEventArgs): Promise<GqlEvent> {
    const { organizationIds, agendaIds, groupIds, cityCodes, ...properties } =
      content;
    const data: Prisma.EventCreateInput = {
      ...properties,
      organizations: {
        create: organizationIds?.map((organizationId) => ({ organizationId })),
      },
      groups: {
        create: groupIds?.map((groupId) => ({ groupId })),
      },
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
      ...event,
      agendas: event.agendas.map((r) => r.agenda),
      totalMinutes: event.stat?.totalMinutes ?? 0,
    };
  }

  static async deleteEvent({
    id,
  }: GqlMutationDeleteEventArgs): Promise<GqlEvent> {
    const event = await this.db.event.delete({
      where: { id },
      include: {
        agendas: { include: { agenda: true } },
        stat: { select: { totalMinutes: true } },
      },
    });
    return {
      ...event,
      agendas: event.agendas.map((r) => r.agenda),
      totalMinutes: event.stat?.totalMinutes ?? 0,
    };
  }

  static async updateEventInfo({
    id,
    content,
  }: GqlMutationUpdateEventInfoArgs): Promise<GqlEvent> {
    const event = await this.db.event.update({
      where: { id },
      data: content,
      include: {
        agendas: { include: { agenda: true } },
        stat: { select: { totalMinutes: true } },
      },
    });
    return {
      ...event,
      agendas: event.agendas.map((r) => r.agenda),
      totalMinutes: event.stat?.totalMinutes ?? 0,
    };
  }
}
