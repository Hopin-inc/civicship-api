import {
  GqlMutationCreateOrganizationArgs,
  GqlMutationDeleteOrganizationArgs,
  GqlMutationUpdateOrganizationArgs,
  GqlOrganization,
  GqlOrganizationsConnection,
  GqlQueryOrganizationArgs,
  GqlQueryOrganizationsArgs,
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";

export default class OrganizationService {
  private static db = prismaClient;

  // TODO: check userId, cities, etc. -> filter
  // TODO why need as GqlOrganization
  static async queryOrganizations({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryOrganizationsArgs): Promise<GqlOrganizationsConnection> {
    const take = first ?? 10;
    const where: Prisma.OrganizationWhereInput = {
      AND: [
        filter?.agendaId
          ? { agendas: { some: { agendaId: filter?.agendaId } } }
          : {},
        filter?.keyword
          ? {
              OR: [
                { name: { contains: filter?.keyword } },
                { bio: { contains: filter?.keyword } },
              ],
            }
          : {},
      ],
    };
    const orderBy: Prisma.OrganizationOrderByWithAggregationInput = {
      updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc,
    };

    const data = await this.db.organization.findMany({
      where,
      include: {
        city: {
          include: {
            state: true,
          },
        },
        state: true,
      },
      orderBy,
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
        node: edge as GqlOrganization | null,
      })),
    };
  }

  // TODO why need as GqlOrganization
  static async getOrganization({
    id,
  }: GqlQueryOrganizationArgs): Promise<GqlOrganization | null> {
    return (await this.db.organization.findUnique({
      where: { id },
      include: {
        city: {
          include: {
            state: true,
          },
        },
        state: true,
      },
    })) as GqlOrganization | null;
  }

  static async createOrganization({
    content,
  }: GqlMutationCreateOrganizationArgs): Promise<GqlOrganization> {
    const { agendaIds, cityCode, stateCode, stateCountryCode, ...properties } =
      content;
    const data: Prisma.OrganizationCreateInput = {
      ...properties,
      state: {
        connect: {
          code_countryCode: { code: stateCode, countryCode: stateCountryCode },
        },
      },
      city: {
        connect: { code: cityCode },
      },
      agendas: {
        create: agendaIds?.map((agendaId) => ({ agendaId })),
      },
    };
    const organization = await this.db.organization.create({
      data,
      include: {
        city: { include: { state: true } },
        state: true,
      },
    });
    return {
      ...organization,
      entityPosition: content.entityPosition,
    };
  }

  static async updateOrganization({
    id,
    content,
  }: GqlMutationUpdateOrganizationArgs): Promise<GqlOrganization> {
    const {
      agendaIds,
      cityCode,
      stateCode,
      stateCountryCode,
      groupIds,
      userIds,
      eventIds,
      cityCodes,
      targetIds,
      ...properties
    } = content;

    const data: Prisma.OrganizationUpdateInput = {
      ...properties,
      state: {
        connect: {
          code_countryCode: { code: stateCode, countryCode: stateCountryCode },
        },
      },
      city: {
        connect: { code: cityCode },
      },
      agendas: agendaIds
        ? {
            connectOrCreate: agendaIds.map((agendaId) => ({
              create: {
                agendaId,
              },
              where: {
                organizationId_agendaId: { organizationId: id, agendaId },
              },
            })),
          }
        : undefined,
      users: userIds
        ? {
            connectOrCreate: userIds.map((userId) => ({
              create: {
                userId,
              },
              where: {
                userId_organizationId: {
                  userId,
                  organizationId: id,
                },
              },
            })),
          }
        : undefined,
      events: eventIds
        ? {
            connectOrCreate: eventIds.map((eventId) => ({
              create: {
                eventId,
              },
              where: {
                organizationId_eventId: {
                  organizationId: id,
                  eventId,
                },
              },
            })),
          }
        : undefined,
      cities: cityCodes
        ? {
            connectOrCreate: cityCodes.map((cityCode) => ({
              create: {
                cityCode,
              },
              where: {
                organizationId_cityCode: {
                  organizationId: id,
                  cityCode,
                },
              },
            })),
          }
        : undefined,
      groups: groupIds
        ? {
            set: groupIds.map((groupId) => ({ id: groupId })),
          }
        : undefined,
      targets: targetIds
        ? {
            connect: targetIds.map((targetId) => ({ id: targetId })),
          }
        : undefined,
    };

    const organization = await this.db.organization.update({
      where: { id },
      data,
      include: {
        city: { include: { state: true } },
        state: true,
      },
    });

    return {
      ...organization,
      entityPosition: content.entityPosition,
    };
  }

  // TODO why need as GqlOrganization
  static async deleteOrganization({
    id,
  }: GqlMutationDeleteOrganizationArgs): Promise<GqlOrganization> {
    return (await this.db.organization.delete({
      where: { id },
      include: {
        city: {
          include: {
            state: true,
          },
        },
        state: true,
      },
    })) as GqlOrganization;
  }
}
