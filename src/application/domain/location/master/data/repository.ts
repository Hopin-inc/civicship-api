import { prismaClient } from "@/infrastructure/prisma/client";
import { cityInclude } from "@/application/domain/location/master/data/type";

export default class MasterRepository {
  private static db = prismaClient;

  static async checkCityExists(id: string) {
    return this.db.city.findUnique({
      where: { code: id },
      include: cityInclude,
    });
  }
}
