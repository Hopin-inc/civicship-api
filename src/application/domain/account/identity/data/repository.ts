import { prismaClient } from "@/infrastructure/prisma/client";
import { IIdentityRepository } from "@/application/domain/account/identity/data/interface";

export default class IdentityRepository implements IIdentityRepository {
  constructor(private readonly db: typeof prismaClient) {}

  async find(uid: string) {
    return this.db.identity.findUnique({
      where: { uid },
    });
  }
}
