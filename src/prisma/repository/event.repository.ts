import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import {
  eventGetInclude,
  eventInclude,
  eventUpdateContentInclude,
} from "@/types/include/event.type";
import { GqlMutationEventDeleteArgs } from "@/types/graphql";

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
      relationLoadStrategy: "join",
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

  static async findForUpdate(id: string) {
    return this.db.event.findUnique({
      where: { id },
      include: eventUpdateContentInclude,
    });
  }

  static async create(data: Prisma.EventCreateInput) {
    return this.db.event.create({
      data,
      include: eventInclude,
    });
  }

  static async delete({ id }: GqlMutationEventDeleteArgs) {
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
}
