import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { refreshMaterializedViewActivityStat } from "@prisma/client/sql";
import { activityGetInclude, activityUpdateContentInclude } from "@/domains/activity/type";

export default class ActivityRepository {
  private static db = prismaClient;

  static async query(
    where: Prisma.ActivityWhereInput,
    orderBy: Prisma.ActivityOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.db.activity.findMany({
      where,
      orderBy,
      include: activityGetInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async checkExists(id: string) {
    return this.db.activity.findUnique({
      where: { id },
    });
  }

  static async find(id: string) {
    return this.db.activity.findUnique({
      where: { id },
      include: activityGetInclude,
    });
  }

  static async findForUpdateContent(id: string) {
    return this.db.activity.findUnique({
      where: { id },
      include: activityUpdateContentInclude,
    });
  }

  static async updateContent(id: string, data: Prisma.ActivityUpdateInput) {
    return this.db.activity.update({
      where: { id },
      data,
      include: activityUpdateContentInclude,
    });
  }

  static async switchPrivacy(id: string, isPublic: boolean) {
    return this.db.activity.update({
      where: { id },
      data: { isPublic: isPublic },
    });
  }

  static async create(data: Prisma.ActivityCreateInput) {
    return this.db.activity.create({
      data,
      include: activityGetInclude,
    });
  }

  static async delete(id: string) {
    return this.db.activity.delete({ where: { id } });
  }

  static async updateRelation(id: string, data: Prisma.ActivityUpdateInput) {
    return this.db.activity.update({
      where: { id },
      data,
    });
  }

  static async refreshStat() {
    return this.db.$queryRawTyped(refreshMaterializedViewActivityStat());
  }
}
