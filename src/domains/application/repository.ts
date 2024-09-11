import { prismaClient } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import {
  applicationUpdateConfirmationInclude,
  applicationCreateInclude,
  applicationGetInclude,
  applicationUpdateContentInclude,
} from "@/domains/application/type";

export default class ApplicationRepository {
  private static db = prismaClient;

  static async query(
    where: Prisma.ApplicationWhereInput,
    orderBy: Prisma.ApplicationOrderByWithRelationInput,
    take: number,
    cursor?: string,
  ) {
    return this.db.application.findMany({
      where,
      orderBy,
      include: applicationGetInclude,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  static async checkExists(id: string) {
    return this.db.application.findUnique({
      where: { id },
    });
  }

  static async find(id: string) {
    return this.db.application.findUnique({
      where: { id },
      include: applicationGetInclude,
    });
  }

  static async findForUpdateContent(id: string) {
    return this.db.application.findUnique({
      where: { id },
      include: applicationUpdateContentInclude,
    });
  }

  static async updateContent(id: string, data: Prisma.ApplicationUpdateInput) {
    return this.db.application.update({
      where: { id },
      data,
      include: applicationUpdateContentInclude,
    });
  }

  static async switchPrivacy(id: string, isPublic: boolean) {
    return this.db.application.update({
      where: { id },
      data: { isPublic },
    });
  }

  static async create(data: Prisma.ApplicationCreateInput) {
    return this.db.application.create({
      data,
      include: applicationCreateInclude,
    });
  }

  static async delete(id: string) {
    return this.db.application.delete({ where: { id } });
  }

  static async updateConfirmation(
    applicationId: string,
    data: Prisma.ApplicationConfirmationCreateInput,
  ) {
    return this.db.application.update({
      where: { id: applicationId },
      data: {
        approvals: {
          create: data,
        },
      },
      include: applicationUpdateConfirmationInclude,
    });
  }

  static async switchIsApproved(
    applicationId: string,
    applicationConfirmationId: string,
    isApproved: boolean,
  ) {
    return this.db.application.update({
      where: { id: applicationId },
      data: {
        approvals: {
          update: {
            where: { id: applicationConfirmationId },
            data: { isApproved },
          },
        },
      },
    });
  }

  static async updateConfirmationComment(
    applicationId: string,
    applicationConfirmationId: string,
    comment?: string,
  ) {
    return this.db.application.update({
      where: { id: applicationId },
      data: {
        approvals: {
          update: {
            where: { id: applicationConfirmationId },
            data: { comment },
          },
        },
      },
      include: applicationUpdateConfirmationInclude,
    });
  }

  static async deleteConfirmation(applicationId: string, applicationConfirmationId: string) {
    return this.db.application.update({
      where: { id: applicationId },
      data: {
        approvals: {
          delete: {
            id: applicationConfirmationId,
          },
        },
      },
    });
  }
}
