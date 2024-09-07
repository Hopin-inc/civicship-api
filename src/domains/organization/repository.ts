import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import {
  organizationGetInclude,
  organizationCreateInclude,
  organizationUpdateContentInclude,
  organizationDefaultInclude,
} from "@/domains/organization/type";

export default class OrganizationRepository {
  private static db = prismaClient;

  static async query(
    where: Prisma.OrganizationWhereInput,
    orderBy: Prisma.OrganizationOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.db.organization.findMany({
      where,
      orderBy,
      include: organizationGetInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async checkExists(id: string) {
    return this.db.organization.findUnique({
      where: { id },
      include: organizationDefaultInclude,
    });
  }

  static async find(id: string) {
    return this.db.organization.findUnique({
      where: { id },
      include: organizationGetInclude,
    });
  }

  static async findForUpdateContent(id: string) {
    return this.db.organization.findUnique({
      where: { id },
      include: organizationUpdateContentInclude,
    });
  }

  static async create(data: Prisma.OrganizationCreateInput) {
    return this.db.organization.create({
      data,
      include: organizationCreateInclude,
    });
  }

  static async delete(id: string) {
    return this.db.organization.delete({ where: { id } });
  }

  static async updateContent(id: string, data: Prisma.OrganizationUpdateInput) {
    return this.db.organization.update({
      where: { id },
      data,
      include: organizationUpdateContentInclude,
    });
  }

  static async updateDefaultInfo(id: string, data: Prisma.OrganizationUpdateInput) {
    return this.db.organization.update({
      where: { id },
      data,
      include: organizationDefaultInclude,
    });
  }

  static async switchPrivacy(id: string, isPublic: boolean) {
    return this.db.organization.update({
      where: { id },
      data: { isPublic: isPublic },
      include: organizationDefaultInclude,
    });
  }

  static async updateRelation(id: string, data: Prisma.OrganizationUpdateInput) {
    return this.db.organization.update({
      where: { id },
      data: data,
      include: organizationDefaultInclude,
    });
  }
}
