import { prismaClient } from "@/infrastructure/prisma/client";
import { cityDefaultInclude } from "@/infrastructure/prisma/types/master";

export default class MasterRepository {
  private static db = prismaClient;

  static async checkCityExists(id: string) {
    return this.db.city.findUnique({
      where: { code: id },
      include: cityDefaultInclude,
    });
  }
}
