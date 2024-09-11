import { prismaClient } from "@/prisma/client";
import { cityDefaultInclude } from "@/domains/master/type";

export default class MasterRepository {
  private static db = prismaClient;

  static async checkIndexExists(id: number) {
    return this.db.index.findUnique({
      where: { id },
    });
  }

  static async checkSkillsetExists(id: number) {
    return this.db.skillset.findUnique({
      where: { id },
    });
  }

  static async checkCityExists(id: string) {
    return this.db.city.findUnique({
      where: { code: id },
      include: cityDefaultInclude,
    });
  }

  static async checkIssueCategoryExists(id: number) {
    return this.db.issueCategory.findUnique({
      where: { id },
    });
  }
}
