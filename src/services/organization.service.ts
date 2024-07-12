import {
  GqlMutationCreateOrganizationArgs,
  GqlOrganization
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";

export default class OrganizationService {
  private static db = prismaClient;

  static async createOrganization({ content }: GqlMutationCreateOrganizationArgs): Promise<GqlOrganization> {
    const { agendaIds, cityCode, stateCode, stateCountryCode, ...properties } = content;
    const data: Prisma.OrganizationCreateInput = {
      ...properties,
      state: {
        connect: {
          code_countryCode: { code: stateCode, countryCode: stateCountryCode }
        }
      },
      city: {
        connect: { code: cityCode }
      },
      agendas: {
        create: agendaIds?.map(agendaId => ({ agendaId }))
      }
    }
    const organization = await this.db.organization.create({
      data,
      include: {
        city: { include: { state: true } },
        state: true,
      }
    });
    return {
      ...organization,
      entityPosition: content.entityPosition,
    }
  }
}
