import { prismaClient } from "@/prisma/client";
import {
  GqlEventUpdateContentPayload,
  GqlEventUpdateGroupPayload,
  GqlEventUpdateOrganizationPayload,
  GqlEventUpdatePrivacyPayload,
  GqlMutationEventUpdateContentArgs,
} from "@/types/graphql";
import { RELATION_ACTION } from "@/consts";
import { Prisma } from "@prisma/client";

const eventExtensionConfig = Prisma.defineExtension({
  model: {
    event: {
      async eventUpdateContent({
        id,
        input,
      }: GqlMutationEventUpdateContentArgs): Promise<GqlEventUpdateContentPayload> {
        const { agendaIds, cityCodes, skillsets, ...properties } = input;
        const data: Prisma.EventUpdateInput = {
          ...properties,
          agendas: {
            upsert: agendaIds?.map((agendaId) => ({
              where: { eventId_agendaId: { agendaId, eventId: id } },
              update: { agenda: { connect: { id: agendaId } } },
              create: { agenda: { connect: { id: agendaId } } },
            })),
          },
          cities: {
            upsert: cityCodes?.map((cityCode) => ({
              where: { eventId_cityCode: { cityCode, eventId: id } },
              update: { city: { connect: { code: cityCode } } },
              create: { city: { connect: { code: cityCode } } },
            })),
          },
          skillsets: {
            upsert: skillsets?.map((skillsetId) => ({
              where: { eventId_skillsetId: { skillsetId, eventId: id } },
              update: { skillset: { connect: { id: skillsetId } } },
              create: { skillset: { connect: { id: skillsetId } } },
            })),
          },
        };
        const event = await prismaClient.event.update({
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
            updatedAt: new Date(),
          },
        };
      },

      async eventUpdatePrivacy(
        id: string,
        isPublic: boolean,
      ): Promise<GqlEventUpdatePrivacyPayload> {
        const event = await prismaClient.event.update({
          where: { id },
          data: { isPublic: isPublic, updatedAt: new Date() },
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

          const event = await tx.event.update({
            where: { id },
            data: {
              groups: {
                [action]: {
                  groupId_eventId: { eventId: id, groupId },
                },
              },
              updatedAt: new Date(),
            },
            include: {
              groups: { include: { group: true } },
              stat: { select: { totalMinutes: true } },
            },
          });

          return {
            event: {
              ...event,
              groups: event.groups.map((r) => r.group),
              totalMinutes: event.stat?.totalMinutes ?? 0,
            },
            group,
          };
        });
      },

      async eventUpdateOrganization(
        id: string,
        organizationId: string,
        action: RELATION_ACTION,
      ): Promise<GqlEventUpdateOrganizationPayload> {
        return await prismaClient.$transaction(async (tx) => {
          const event = await tx.event.update({
            where: { id },
            data: {
              organizations: {
                [action]: {
                  organizationId_eventId: {
                    eventId: id,
                    organizationId,
                  },
                },
              },
              updatedAt: new Date(),
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
          });

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
        });
      },
    },
  },
});

export { eventExtensionConfig };
