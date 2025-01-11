import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import {
  eventGetInclude,
  eventCreateInclude,
  eventUpdateContentInclude,
} from "@/domains/event/type";
import { refreshMaterializedViewEventStat } from "@prisma/client/sql";

export default class EventRepository {
  private static db = prismaClient;

  static async queryPublic(
    where: Prisma.EventWhereInput,
    orderBy: Prisma.EventOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.db.event.findMany({
      where,
      orderBy,
      include: eventGetInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async find(id: string) {
    return this.db.event.findUnique({
      where: { id },
      include: eventGetInclude,
    });
  }

  static async findForUpdateContent(id: string) {
    return this.db.event.findUnique({
      where: { id },
      include: eventUpdateContentInclude,
    });
  }

  static async findForUpdateRelation(id: string) {
    return this.db.event.findUnique({
      where: { id },
    });
  }

  static async create(data: Prisma.EventCreateInput) {
    return this.db.event.create({
      data,
      include: eventCreateInclude,
    });
  }

  static async delete(id: string) {
    return this.db.event.delete({ where: { id } });
  }

  static async updateContent(id: string, data: Prisma.EventUpdateInput) {
    return this.db.event.update({
      where: { id },
      data,
      include: eventUpdateContentInclude,
    });
  }

  static async switchPrivacy(id: string, isPublic: boolean) {
    return this.db.event.update({
      where: { id },
      data: { isPublic: isPublic },
    });
  }

  static async updateRelation(id: string, data: Prisma.EventUpdateInput) {
    return this.db.event.update({
      where: { id },
      data: data,
    });
  }

  static async refreshStat() {
    return this.db.$queryRawTyped(refreshMaterializedViewEventStat());
  }
}
