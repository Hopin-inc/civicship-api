import { prismaClient } from "@/prisma/client";

export default class UserRepository {
  private static db = prismaClient;

  static checkExists(id: string) {
    return this.db.user.findUnique({
      where: { id },
    });
  }
}
