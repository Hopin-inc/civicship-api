import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { commentCreateInclude, commentUpdateInclude } from "@/domains/comment/type";

export default class CommentRepository {
  private static db = prismaClient;

  static async createToEvent(data: Prisma.CommentCreateInput) {
    return this.db.comment.create({
      data,
      include: commentCreateInclude,
    });
  }

  static async update(id: string, data: Prisma.CommentUpdateInput) {
    return this.db.comment.update({
      where: { id },
      data,
      include: commentUpdateInclude,
    });
  }

  static async delete(id: string) {
    return this.db.comment.delete({
      where: { id },
    });
  }
}
