import { prismaClient } from "@/infra/prisma/client";

export default class IdentityRepository {
  private static db = prismaClient;

  static async find(uid: string) {
    return this.db.identity.findUnique({
      where: { uid },
    });
  }
}
