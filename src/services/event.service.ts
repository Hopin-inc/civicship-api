import {
  GqlEvent,
  GqlEventsConnection,
  GqlQueryEventArgs,
  GqlQueryEventsArgs,
  GqlMutationEventCreateArgs,
  GqlMutationEventDeleteArgs,
  GqlMutationEventUpdateContentArgs,
  GqlMutationEventPublishArgs,
  GqlMutationEventUnpublishArgs,
  GqlMutationEventAddGroupArgs,
  GqlMutationEventRemoveGroupArgs,
  GqlMutationEventAddOrganizationArgs,
  GqlMutationEventRemoveOrganizationArgs,
  GqlEventCreatePayload,
  GqlEventDeletePayload,
  GqlEventUpdateContentPayload,
  GqlEventUpdatePrivacyPayload,
  GqlEventUpdateGroupPayload,
  GqlEventUpdateOrganizationPayload,
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import { handleError } from "@/utils/error";
import { RELATION_ACTION } from "@/consts";
import { Prisma } from "@prisma/client";

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
        filter?.agendaId ? { agendas: { some: { agendaId: filter?.agendaId } } } : {},
        filter?.cityCode ? { cities: { some: { cityCode: filter?.cityCode } } } : {},
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
        cities: { include: { city: { include: { state: true } } } },
        skillsets: { include: { skillset: true } },
        organizations: {
          include: {
            organization: {
              include: {
                city: {
                  include: {
                    state: true,
                  },
                },
                state: true,
              },
            },
          },
        },
        groups: { include: { group: true } },
        stat: { select: { totalMinutes: true } },
      },
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const hasNextPage = data.length > take;
    const formattedData: GqlEvent[] = data.slice(0, take).map((record) => ({
      ...record,
      agendas: record.agendas?.map((r) => r.agenda),
      cities: record.cities?.map((r) => ({
        ...r.city,
        state: r.city?.state,
      })),
      skillsets: record.skillsets?.map((r) => r.skillset),
      organizations: record.organizations?.map((r) => ({
        ...r.organization,
        city: {
          ...r.organization.city,
          state: r.organization.city?.state,
        },
        state: r.organization.state,
      })),
      groups: record.groups?.map((r) => r.group),
      totalMinutes: record.stat?.totalMinutes ?? 0,
    }));
    return {
      totalCount: data.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: formattedData[0]?.id,
        endCursor: formattedData.length ? formattedData[formattedData.length - 1].id : undefined,
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
        cities: { include: { city: { include: { state: true } } } },
        skillsets: { include: { skillset: true } },
        organizations: {
          include: {
            organization: {
              include: {
                city: {
                  include: {
                    state: true,
                  },
                },
                state: true,
              },
            },
          },
        },
        groups: { include: { group: true } },
        stat: { select: { totalMinutes: true } },
      },
    });
    return event
      ? {
          ...event,
          agendas: event.agendas.map((r) => r.agenda),
          cities: event.cities.map((r) => ({
            ...r.city,
            state: r.city.state,
          })),
          skillsets: event.skillsets.map((r) => r.skillset),
          organizations: event.organizations.map((r) => ({
            ...r.organization,
            city: {
              ...r.organization.city,
              state: r.organization.city.state,
            },
            state: r.organization.state,
          })),
          groups: event.groups.map((r) => r.group),
          totalMinutes: event.stat?.totalMinutes ?? 0,
        }
      : null;
  }

  static async eventCreate({ input }: GqlMutationEventCreateArgs): Promise<GqlEventCreatePayload> {
    try {
      const { agendaIds, cityCodes, skillsets, organizationIds, groupIds, ...properties } = input;
      const data: Prisma.EventCreateInput = {
        ...properties,
        agendas: {
          create: agendaIds?.map((agendaId) => ({ agenda: { connect: { id: agendaId } } })),
        },
        cities: {
          create: cityCodes?.map((cityCode) => ({ city: { connect: { code: cityCode } } })),
        },
        skillsets: {
          create: skillsets?.map((skillsetId) => ({
            skillset: { connect: { id: skillsetId } },
          })),
        },
        organizations: {
          create: organizationIds?.map((organizationId) => ({
            organization: { connect: { id: organizationId } },
          })),
        },
        groups: {
          create: groupIds?.map((groupId) => ({
            group: { connect: { id: groupId } },
          })),
        },
      };

      const event = await this.db.event.create({
        data,
        include: {
          agendas: { include: { agenda: true } },
          cities: { include: { city: { include: { state: true } } } },
          skillsets: { include: { skillset: true } },
          organizations: {
            include: {
              organization: {
                include: {
                  city: {
                    include: {
                      state: true,
                    },
                  },
                  state: true,
                },
              },
            },
          },
          groups: { include: { group: true } },
        },
      });

      return {
        __typename: "EventCreateSuccess",
        event: {
          ...event,
          agendas: event.agendas.map((r) => r.agenda),
          cities: event.cities.map((r) => ({
            ...r.city,
            state: r.city.state,
          })),
          skillsets: event.skillsets.map((r) => r.skillset),
          organizations: event.organizations.map((r) => ({
            ...r.organization,
            city: {
              ...r.organization.city,
              state: r.organization.city.state,
            },
            state: r.organization.state,
          })),
          groups: event.groups.map((r) => r.group),
        },
      };
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventUpdateContent({
    id,
    input,
  }: GqlMutationEventUpdateContentArgs): Promise<GqlEventUpdateContentPayload> {
    try {
      return await this.db.event.eventUpdateContent({ id: id, input: input });
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventDelete({ id }: GqlMutationEventDeleteArgs): Promise<GqlEventDeletePayload> {
    await this.db.event.delete({
      where: { id },
    });
    return { eventId: id };
  }

  static async eventPublish({
    id,
  }: GqlMutationEventPublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    try {
      return await this.db.event.eventUpdatePrivacy(id, true);
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventUnpublish({
    id,
  }: GqlMutationEventUnpublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    try {
      return await this.db.event.eventUpdatePrivacy(id, false);
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventAddGroup({
    id,
    input,
  }: GqlMutationEventAddGroupArgs): Promise<GqlEventUpdateGroupPayload> {
    try {
      return await this.db.event.eventUpdateGroup(id, input.groupId, RELATION_ACTION.CONNECT);
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventRemoveGroup({
    id,
    input,
  }: GqlMutationEventRemoveGroupArgs): Promise<GqlEventUpdateGroupPayload> {
    try {
      return await this.db.event.eventUpdateGroup(id, input.groupId, RELATION_ACTION.DISCONNECT);
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventAddOrganization({
    id,
    input,
  }: GqlMutationEventAddOrganizationArgs): Promise<GqlEventUpdateOrganizationPayload> {
    try {
      return await this.db.event.eventUpdateOrganization(
        id,
        input.organizationId,
        RELATION_ACTION.CONNECT,
      );
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventRemoveOrganization({
    id,
    input,
  }: GqlMutationEventRemoveOrganizationArgs): Promise<GqlEventUpdateOrganizationPayload> {
    try {
      return await this.db.event.eventUpdateOrganization(
        id,
        input.organizationId,
        RELATION_ACTION.DISCONNECT,
      );
    } catch (error) {
      return await handleError(error);
    }
  }
}
