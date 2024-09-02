import {
  GqlEventUpdateContentInput,
  GqlMutationEventPlanArgs,
  GqlQueryEventsArgs,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { calculateDifferences } from "@/utils";
import { EventUpdateContentPayloadWithArgs } from "@/domains/event/type";
import { RELATION_ACTION } from "@/consts";

export default class EventInputFormat {
  static filter({ filter }: GqlQueryEventsArgs): Prisma.EventWhereInput {
    return {
      AND: [
        { isPublic: true },
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
  }

  static sort({ sort }: GqlQueryEventsArgs): Prisma.EventOrderByWithRelationInput {
    return {
      startsAt: sort?.startsAt ?? Prisma.SortOrder.desc,
    };
  }

  static create({ input }: GqlMutationEventPlanArgs): Prisma.EventCreateInput {
    const { agendaIds, cityCodes, skillsets, organizationIds, groupIds, ...properties } = input;

    return {
      ...properties,
      agendas: {
        createMany: {
          data:
            agendaIds?.map((agendaId) => ({
              agendaId,
            })) ?? [],
          skipDuplicates: true,
        },
      },
      cities: {
        createMany: {
          data:
            cityCodes?.map((cityCode) => ({
              cityCode,
            })) ?? [],
          skipDuplicates: true,
        },
      },
      skillsets: {
        createMany: {
          data:
            skillsets?.map((skillsetId) => ({
              skillsetId: skillsetId,
            })) ?? [],
          skipDuplicates: true,
        },
      },
      organizations: {
        createMany: {
          data:
            organizationIds?.map((organizationId) => ({
              organizationId: organizationId,
            })) ?? [],
          skipDuplicates: true,
        },
      },
      groups: {
        createMany: {
          data:
            groupIds?.map((groupId) => ({
              groupId: groupId,
            })) ?? [],
          skipDuplicates: true,
        },
      },
    };
  }

  static updateContent(
    existingEvent: EventUpdateContentPayloadWithArgs,
    input: GqlEventUpdateContentInput,
  ): Prisma.EventUpdateInput {
    const { agendaIds, cityCodes, skillsets, ...properties } = input;

    const [
      { toAdd: agendasToAdd, toRemove: agendasToRemove },
      { toAdd: citiesToAdd, toRemove: citiesToRemove },
      { toAdd: skillsetsToAdd, toRemove: skillsetsToRemove },
    ] = [
      calculateDifferences(new Set(existingEvent.agendas.map((r) => r.agendaId)), agendaIds),
      calculateDifferences(new Set(existingEvent.cities.map((r) => r.cityCode)), cityCodes),
      calculateDifferences(new Set(existingEvent.skillsets.map((r) => r.skillsetId)), skillsets),
    ];

    return {
      ...properties,
      agendas: {
        createMany: {
          data: agendasToAdd.map((agendaId) => ({
            agendaId: agendaId,
          })),
          skipDuplicates: true,
        },
        deleteMany: {
          agendaId: { in: agendasToRemove },
        },
      },
      cities: {
        createMany: {
          data: citiesToAdd.map((cityCode) => ({
            cityCode: cityCode,
          })),
          skipDuplicates: true,
        },
        deleteMany: {
          cityCode: { in: citiesToRemove },
        },
      },
      skillsets: {
        createMany: {
          data: skillsetsToAdd.map((skillsetId) => ({
            skillsetId: skillsetId,
          })),
          skipDuplicates: true,
        },
        deleteMany: {
          skillsetId: { in: skillsetsToRemove },
        },
      },
    };
  }

  static updateGroup(
    id: string,
    groupId: string,
    action: RELATION_ACTION,
  ): Prisma.EventUpdateInput {
    const data: Prisma.EventUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECTORCREATE:
        data.groups = {
          connectOrCreate: {
            where: {
              groupId_eventId: { groupId, eventId: id },
            },
            create: { groupId },
          },
        };
        break;

      case RELATION_ACTION.DELETE:
        data.groups = {
          delete: {
            groupId_eventId: { groupId, eventId: id },
            groupId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }

  static updateOrganization(
    id: string,
    organizationId: string,
    action: RELATION_ACTION,
  ): Prisma.EventUpdateInput {
    const data: Prisma.EventUpdateInput = {};

    switch (action) {
      case RELATION_ACTION.CONNECTORCREATE:
        data.organizations = {
          connectOrCreate: {
            where: {
              organizationId_eventId: { organizationId: organizationId, eventId: id },
            },
            create: { organizationId: organizationId },
          },
        };
        break;

      case RELATION_ACTION.DELETE:
        data.organizations = {
          delete: {
            organizationId_eventId: { eventId: id, organizationId: organizationId },
            organizationId,
          },
        };
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return data;
  }
}
