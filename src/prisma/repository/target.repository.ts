import { prismaClient } from "@/prisma/client";

export default class TargetRepository {
  private static db = prismaClient;

  static checkExists(id: string) {
    return this.db.target.findUnique({
      where: { id },
    });
  }
}
