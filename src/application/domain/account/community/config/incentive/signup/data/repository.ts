import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import ISignupBonusConfigRepository from "./interface";
import SignupBonusConfigConverter from "./converter";

@injectable()
export default class SignupBonusConfigRepository implements ISignupBonusConfigRepository {
  constructor(
    @inject("SignupBonusConfigConverter")
    private readonly converter: SignupBonusConfigConverter,
  ) {}
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
    // Use the converter to transform update input to create input
    const createData = this.converter.toCreateInput(communityId, data);

    return tx.communitySignupBonusConfig.upsert({
      where: { communityId },
      create: createData,
      update: data,
    });
  }
}
