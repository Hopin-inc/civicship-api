import { prismaClient } from "@/infrastructure/prisma/client";
import { IIdentityRepository } from "@/application/domain/account/identity/data/interface";
import { injectable, inject } from "tsyringe";
import { identitySelectDetail } from "@/application/domain/account/identity/data/type";
import { IdentityPlatform, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

@injectable()
export default class IdentityRepository implements IIdentityRepository {
  constructor(@inject("prismaClient") private readonly db: typeof prismaClient) {}

  async find(uid: string) {
    return this.db.identity.findUnique({
      where: { uid },
      select: identitySelectDetail,
    });
  }

  async findByUidAndCommunity(
    uid: string,
    platform: IdentityPlatform,
    communityId: string | null,
  ) {
    return this.db.identity.findFirst({
      where: {
        uid,
        platform,
        communityId,
      },
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

  async update(uid: string, data: Prisma.IdentityUpdateInput) {
    return this.db.identity.update({
      where: { uid },
      data,
      select: identitySelectDetail,
    });
  }
}
