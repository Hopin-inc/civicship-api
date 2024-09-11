import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import {
  issueCreateInclude,
  issueGetInclude,
  issueUpdateContentInclude,
} from "@/domains/issue/type";
import { refreshMaterializedViewIssueStat } from "@prisma/client/sql";

export default class IssueRepository {
  private static db = prismaClient;

  static async query(
    where: Prisma.IssueWhereInput,
    orderBy: Prisma.IssueOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.db.issue.findMany({
      where,
      orderBy,
      include: issueGetInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async checkExists(id: string) {
    return this.db.issue.findUnique({
      where: { id },
    });
  }

  static async find(id: string) {
    return this.db.issue.findUnique({
      where: { id },
      include: issueGetInclude,
    });
  }

  static async findForUpdateContent(id: string) {
    return this.db.issue.findUnique({
      where: { id },
      include: issueUpdateContentInclude,
    });
  }

  static async create(data: Prisma.IssueCreateInput) {
    return this.db.issue.create({
      data,
      include: issueCreateInclude,
    });
  }

  static async delete(id: string) {
    return this.db.issue.delete({ where: { id } });
  }

  static async updateContent(id: string, data: Prisma.IssueUpdateInput) {
    return this.db.issue.update({
      where: { id },
      data,
      include: issueUpdateContentInclude,
    });
  }

  static async updateRelation(id: string, data: Prisma.IssueUpdateInput) {
    return this.db.issue.update({
      where: { id },
      data: data,
    });
  }

  static async switchPrivacy(id: string, isPublic: boolean) {
    return this.db.issue.update({
      where: { id },
      data: { isPublic: isPublic },
    });
  }

  static async refreshStat() {
    await this.db.$queryRawTyped(refreshMaterializedViewIssueStat());
  }
}
