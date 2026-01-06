import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import ISignupBonusConfigRepository from "./interface";

@injectable()
export default class SignupBonusConfigRepository implements ISignupBonusConfigRepository {
  async get(ctx: IContext, communityId: string, tx?: Prisma.TransactionClient) {
    if (tx) {
      return tx.communitySignupBonusConfig.findUnique({
        where: { communityId },
      });
    }
    return ctx.issuer.public(ctx, (tx) =>
      tx.communitySignupBonusConfig.findUnique({
        where: { communityId },
      }),
    );
  }

  async upsert(
    ctx: IContext,
    communityId: string,
    data: Prisma.CommunitySignupBonusConfigUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.communitySignupBonusConfig.upsert({
      where: { communityId },
      create: {
        communityId,
        ...data,
      },
      update: data,
    });
  }
}
