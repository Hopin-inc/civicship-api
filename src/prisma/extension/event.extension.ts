import { prismaClient } from "@/prisma/client";
import {
  GqlEventPlanPayload,
  GqlEventUpdateContentPayload,
  GqlEventUpdateGroupPayload,
  GqlEventUpdateOrganizationPayload,
  GqlEventUpdatePrivacyPayload,
  GqlMutationEventPlanArgs,
  GqlMutationEventUpdateContentArgs,
} from "@/types/graphql";
import { RELATION_ACTION } from "@/consts";
import { Prisma } from "@prisma/client";

const eventExtension = Prisma.defineExtension({
  model: {
    event: {
      async plan({ input }: GqlMutationEventPlanArgs): Promise<GqlEventPlanPayload> {
        {
          const { agendaIds, cityCodes, skillsets, organizationIds, groupIds, ...properties } =
            input;

          const data: Prisma.EventCreateInput = {
            ...properties,
            agendas: {
              create: agendaIds?.map((agendaId) => ({
                agendaId: agendaId,
              })),
            },
            cities: {
              create: cityCodes?.map((cityCode) => ({
                cityCode: cityCode,
              })),
            },
            skillsets: {
              create: skillsets?.map((skillsetId) => ({
                skillsetId: skillsetId,
              })),
            },
            organizations: {
              create: organizationIds?.map((organizationId) => ({
                organizationId: organizationId,
              })),
            },
            groups: {
              create: groupIds?.map((groupId) => ({
                groupId: groupId,
              })),
            },
          };

          const event = await prismaClient.event.create({
            data,
            include: {
              agendas: { include: { agenda: true } },
              cities: { include: { city: { include: { state: true } } } },
              skillsets: { include: { skillset: true } },
              organizations: {
                include: {
                  organization: {
                    include: {
                      city: { include: { state: true } },
                      state: true,
                    },
                  },
                },
              },
              groups: { include: { group: true } },
            },
          });

          return {
            __typename: "EventPlanSuccess",
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
        }
      },

      async updateContent({
        id,
        input,
      }: GqlMutationEventUpdateContentArgs): Promise<GqlEventUpdateContentPayload> {
        const { agendaIds, cityCodes, skillsets, ...properties } = input;

        const existingEvent = await prismaClient.event.findUnique({
          where: { id },
          include: {
            agendas: true,
            cities: true,
            skillsets: true,
          },
        });

        if (!existingEvent) {
          throw new Error(`Event with ID ${id} not found`);
        }

        const [
          { toAdd: agendasToAdd, toRemove: agendasToRemove },
          { toAdd: citiesToAdd, toRemove: citiesToRemove },
          { toAdd: skillsetsToAdd, toRemove: skillsetsToRemove },
        ] = [
          calculateDifferences(new Set(existingEvent.agendas.map((r) => r.agendaId)), agendaIds),
          calculateDifferences(new Set(existingEvent.cities.map((r) => r.cityCode)), cityCodes),
          calculateDifferences(
            new Set(existingEvent.skillsets.map((r) => r.skillsetId)),
            skillsets,
          ),
        ];

        const data: Prisma.EventUpdateInput = {
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

        const event = await prismaClient.event.update({
          where: { id },
          data,
          include: {
            agendas: { include: { agenda: true } },
            cities: { include: { city: { include: { state: true } } } },
            skillsets: { include: { skillset: true } },
          },
        });

        return {
          __typename: "EventUpdateContentSuccess",
          event: {
            ...event,
            agendas: event.agendas.map((r) => r.agenda),
            cities: event.cities.map((r) => ({
              ...r.city,
              state: r.city.state,
            })),
            skillsets: event.skillsets.map((r) => r.skillset),
          },
        };
      },

      async updatePrivacy(id: string, isPublic: boolean): Promise<GqlEventUpdatePrivacyPayload> {
        const event = await prismaClient.event.update({
          where: { id },
          data: { isPublic: isPublic },
        });

        return {
          __typename: "EventUpdatePrivacySuccess",
          event: event,
        };
      },

      async eventUpdateGroup(
        id: string,
        groupId: string,
        action: RELATION_ACTION,
      ): Promise<GqlEventUpdateGroupPayload> {
        return await prismaClient.$transaction(async (tx) => {
          const group = await tx.group.findUnique({ where: { id: groupId } });

          if (!group) {
            throw new Error(`Group with ID ${groupId} not found`);
          }

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

          const event = await tx.event.update({
            where: { id },
            data: data,
          });

          return {
            __typename: "EventUpdateGroupSuccess",
            event,
            group,
          };
        });
      },

      async updateOrganization(
        id: string,
        organizationId: string,
        action: RELATION_ACTION,
      ): Promise<GqlEventUpdateOrganizationPayload> {
        return await prismaClient.$transaction(async (tx) => {
          const organization = await tx.organization.findUnique({
            where: { id: organizationId },
            include: {
              city: {
                include: {
                  state: true,
                },
              },
              state: true,
            },
          });

          if (!organization) {
            throw new Error(`Organization with ID ${organizationId} not found`);
          }

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

          const event = await tx.event.update({
            where: { id },
            data: data,
          });

          return {
            __typename: "EventUpdateOrganizationSuccess",
            event,
            organization,
          };
        });
      },
    },
  },
});

function calculateDifferences<T>(existingIds: Set<T>, newIds?: T[]) {
  const toAdd = newIds?.filter((id) => !existingIds.has(id)) || [];
  const toRemove = [...existingIds].filter((id) => !newIds?.includes(id));
  return { toAdd, toRemove };
}

export { eventExtension };
