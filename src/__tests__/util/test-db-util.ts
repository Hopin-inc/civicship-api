import { prismaClient } from "@/prisma/client";

export default class TestDbUtil {
  static $disconnect() {
    throw new Error("Method not implemented.");
  }
  private static db = prismaClient;

  static async findAll() {
    return await this.db.user.findMany();
  }

  static async deleteAll() {
    return await this.db.user.deleteMany();
  }

  static async disconnect() {
    return this.db.$disconnect()
  }

  // TODO: 実際テストで使うメソッドを整える

  // static async query(
  //   where: Prisma.UserWhereInput,
  //   orderBy: Prisma.UserOrderByWithRelationInput,
  //   take: number,
  //   cursor?: string,
  // ) {
  //   return this.db.user.findMany({
  //     where,
  //     orderBy,
  //     include: userGetInclude,
  //     take: take + 1,
  //     skip: cursor ? 1 : 0,
  //     cursor: cursor ? { id: cursor } : undefined,
  //   });
  // }

  // static async checkExists(id: string) {
  //   return this.db.user.findUnique({
  //     where: { id },
  //   });
  // }

  // static async find(id: string) {
  //   return this.db.user.findUnique({
  //     where: { id },
  //     include: userGetInclude,
  //   });
  // }

  // static async findForUpdateContent(id: string) {
  //   return this.db.user.findUnique({
  //     where: { id },
  //     include: userUpdateContentInclude,
  //   });
  // }

  // static async updateContent(id: string, data: Prisma.UserUpdateInput) {
  //   return this.db.user.update({
  //     where: { id },
  //     data,
  //     include: userUpdateContentInclude,
  //   });
  // }

  // static async switchPrivacy(id: string, isPublic: boolean) {
  //   return this.db.user.update({
  //     where: { id },
  //     data: { isPublic: isPublic },
  //   });
  // }

  // static async create(data: Prisma.UserCreateInput) {
  //   return this.db.user.create({
  //     data,
  //     include: userCreateInclude,
  //   });
  // }

  // static async updateRelation(id: string, data: Prisma.UserUpdateInput) {
  //   return this.db.user.update({
  //     where: { id },
  //     data: data,
  //   });
  // }
}
