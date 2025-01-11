import { PrismaClientIssuer } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { refreshMaterializedViewActivityStat } from "@prisma/client/sql";
import { activityGetInclude, activityUpdateContentInclude } from "@/domains/activity/type";
import { IContext } from "@/types/server";

export default class ActivityRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.ActivityWhereInput,
    orderBy: Prisma.ActivityOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, tx => {
      return tx.activity.findMany({
        where,
        orderBy,
        include: activityGetInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async checkExists(ctx: IContext, id: string) {
    return this.issuer.public(ctx, tx => {
      return tx.activity.findUnique({
        where: { id },
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, tx => {
      return tx.activity.findUnique({
        where: { id },
        include: activityGetInclude,
      });
    });
  }

  static async findForUpdateContent(ctx: IContext, id: string) {
    return this.issuer.public(ctx, tx => {
      return tx.activity.findUnique({
        where: { id },
        include: activityUpdateContentInclude,
      });
    });
  }

  static async updateContent(ctx: IContext, id: string, data: Prisma.ActivityUpdateInput) {
    return this.issuer.public(ctx, tx => {
      return tx.activity.update({
        where: { id },
        data,
        include: activityUpdateContentInclude,
      });
    });
  }

  static async switchPrivacy(ctx: IContext, id: string, isPublic: boolean) {
    return this.issuer.public(ctx, tx => {
      return tx.activity.update({
        where: { id },
        data: { isPublic: isPublic },
      });
    });
  }

  static async create(ctx: IContext, data: Prisma.ActivityCreateInput) {
    return this.issuer.public(ctx, tx => {
      return tx.activity.create({
        data,
        include: activityGetInclude,
      });
    });
  }

  static async delete(ctx: IContext, id: string) {
    return this.issuer.public(ctx, tx => {
      return tx.activity.delete({ where: { id } });
    });
  }

  static async updateRelation(ctx: IContext, id: string, data: Prisma.ActivityUpdateInput) {
    return this.issuer.public(ctx, tx => {
      return tx.activity.update({
        where: { id },
        data,
      });
    });
  }

  static async refreshStat(ctx: IContext) {
    return this.issuer.public(ctx, tx => {
      return tx.$queryRawTyped(refreshMaterializedViewActivityStat());
    });
  }
}
