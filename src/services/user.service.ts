import {
  GqlMutationCreateUserArgs,
  GqlUser
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";

export default class UserService {
  private static db = prismaClient;

  static async createUser({ content }: GqlMutationCreateUserArgs): Promise<GqlUser> {
    const { organizationIds, agendaIds, cityCodes, ...properties } = content;
    const data: Prisma.UserCreateInput = {
      ...properties,
      organizations: {
        create: organizationIds?.map(organizationId => ({ organizationId }))
      },
      agendas: {
        create: agendaIds?.map(agendaId => ({ agendaId }))
      },
      cities: {
        create: cityCodes?.map(cityCode => ({ cityCode }))
      }
    }
    return this.db.user.create({ data });
  }
}
