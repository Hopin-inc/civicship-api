import { prismaClient } from "@/prisma/client";
import { organizationBaseInclude } from "@/domains/organization/type";

export default class OrganizationRepository {
  private static db = prismaClient;

  static find(id: string) {
    return this.db.organization.findUnique({
      where: { id },
      include: organizationBaseInclude,
    });
  }
}
