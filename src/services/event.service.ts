import { Prisma } from "@prisma/client";
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
      agendas: record.agendas.map((r) => r.agenda),
      cities: record.cities.map((r) => ({
        ...r.city,
        state: r.city.state,
      })),
      skillsets: record.skillsets.map((r) => r.skillset),
      organizations: record.organizations.map((r) => ({
        ...r.organization,
        city: {
          ...r.organization.city,
          state: r.organization.city.state,
        },
        state: r.organization.state,
      })),
      groups: record.groups.map((r) => r.group),
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
        stat: { select: { totalMinutes: true } },
      },
    });
    return {
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
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async eventDelete({ id }: GqlMutationEventDeleteArgs): Promise<GqlEventDeletePayload> {
    await this.db.event.delete({
      where: { id },
    });
    return { eventId: id };
  }

  static async eventUpdateContent({
    id,
    input,
  }: GqlMutationEventUpdateContentArgs): Promise<GqlEventUpdateContentPayload> {
    const { agendaIds, cityCodes, skillsets, ...properties } = input;
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
    };
    const event = await this.db.event.update({
      where: { id },
      data,
      include: {
        agendas: { include: { agenda: true } },
        cities: { include: { city: { include: { state: true } } } },
        skillsets: { include: { skillset: true } },
        stat: { select: { totalMinutes: true } },
      },
    });
    return {
      event: {
        ...event,
        agendas: event.agendas.map((r) => r.agenda),
        cities: event.cities.map((r) => ({
          ...r.city,
          state: r.city.state,
        })),
        skillsets: event.skillsets.map((r) => r.skillset),
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async eventPublish({
    id,
  }: GqlMutationEventPublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    const event = await this.db.event.update({
      where: { id },
      data: { isPublic: true },
      include: {
        stat: { select: { totalMinutes: true } },
      },
    });
    return {
      event: {
        ...event,
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
    };
  }

  static async eventUnpublish({
    id,
  }: GqlMutationEventUnpublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    const event = await this.db.event.update({
      where: { id },
      data: { isPublic: false },
      include: {
        stat: { select: { totalMinutes: true } },
      },
    });
    return {
      event: {
        ...event,
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
          groups: { include: { group: true } },
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
        groups: event.groups.map((r) => r.group),
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
          groups: { include: { group: true } },
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
        groups: event.groups.map((r) => r.group),
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
        organizations: event.organizations.map((r) => ({
          ...r.organization,
          city: {
            ...r.organization.city,
            state: r.organization.city.state,
          },
          state: r.organization.state,
        })),
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
        organizations: event.organizations.map((r) => ({
          ...r.organization,
          city: {
            ...r.organization.city,
            state: r.organization.city.state,
          },
          state: r.organization.state,
        })),
        totalMinutes: event.stat?.totalMinutes ?? 0,
      },
      organization,
    };
  }
}
