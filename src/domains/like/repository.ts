import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { likeCreateInclude } from "@/domains/like/type";

export default class LikeRepository {
  private static db = prismaClient;

  static async createToEvent(data: Prisma.LikeCreateInput) {
    return this.db.like.create({
      data,
      include: likeCreateInclude,
    });
  }

  static async delete(id: string) {
    return this.db.like.delete({
      where: { id },
    });
  }
}
