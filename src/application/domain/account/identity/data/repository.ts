import { prismaClient } from "@/infrastructure/prisma/client";
import { IIdentityRepository } from "@/application/domain/account/identity/data/interface";
import { injectable, inject } from "tsyringe";
import { identitySelectDetail } from "@/application/domain/account/identity/data/type";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

@injectable()
export default class IdentityRepository implements IIdentityRepository {
  constructor(@inject("prismaClient") private readonly db: typeof prismaClient) {}

  async find(uid: string, communityId?: string | null) {
    return this.db.identity.findUnique({
      where: { uid_communityId: { uid, communityId: communityId ?? null } },
      select: identitySelectDetail,
    });
  }

  async findByUid(uid: string) {
    return this.db.identity.findFirst({
      where: { uid },
      select: identitySelectDetail,
    });
  }

  async create(ctx: IContext, data: Prisma.IdentityCreateInput, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.identity.create({
        data,
        select: identitySelectDetail,
      });
    } else {
      return ctx.issuer.internal(async (tx) => {
        return tx.identity.create({
          data,
          select: identitySelectDetail,
        });
      });
    }
  }

  async update(uid: string, communityId: string | null, data: Prisma.IdentityUpdateInput) {
    return this.db.identity.update({
      where: { uid_communityId: { uid, communityId } },
      data,
      select: identitySelectDetail,
    });
  }
}
