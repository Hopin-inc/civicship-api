import { prismaClient } from "@/infrastructure/prisma/client";
import { IIdentityRepository } from "@/application/domain/account/identity/data/interface";
import { injectable, inject } from "tsyringe";

@injectable()
export default class IdentityRepository implements IIdentityRepository {
  constructor(@inject("prismaClient") private readonly db: typeof prismaClient) { }

  async find(uid: string) {
    return this.db.identity.findUnique({
      where: { uid },
    });
  }
}
