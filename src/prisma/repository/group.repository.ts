import { prismaClient } from "@/prisma/client";

export default class GroupRepository {
  private static db = prismaClient;

  static async findGroupById(id: string) {
    return this.db.group.findUnique({
      where: { id },
    });
  }
}
