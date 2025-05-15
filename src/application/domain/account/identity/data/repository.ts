import { prismaClient } from "@/infrastructure/prisma/client";
import { IIdentityRepository } from "@/application/domain/account/identity/data/interface";
import { injectable, inject } from "tsyringe";
import { identitySelectDetail } from "@/application/domain/account/identity/data/type";
import { Prisma } from "@prisma/client";

@injectable()
export default class IdentityRepository implements IIdentityRepository {
  constructor(@inject("prismaClient") private readonly db: typeof prismaClient) {}

  async find(uid: string) {
    return this.db.identity.findUnique({
      where: { uid },
      select: identitySelectDetail,
    });
  }

  async update(uid: string, data: Prisma.IdentityUpdateInput) {
    return this.db.identity.update({
      where: { uid },
      data,
      select: identitySelectDetail,
    });
  }
}
