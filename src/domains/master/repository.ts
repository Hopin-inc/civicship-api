import { prismaClient } from "@/prisma/client";
import { cityDefaultInclude } from "@/domains/master/type";

export default class MasterRepository {
  private static db = prismaClient;

  static async checkCityExists(id: string) {
    return this.db.city.findUnique({
      where: { code: id },
      include: cityDefaultInclude,
    });
  }
}
