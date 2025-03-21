import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { OnboardingStatus, Prisma, Todo } from "@prisma/client";

export default class OnboardingRepository {
  private static issuer = new PrismaClientIssuer();

  static async find(ctx: IContext, userId: string, todo: Todo, status: OnboardingStatus) {
    return this.issuer.public(ctx, (tx) => {
      return tx.onboarding.findFirst({
        where: { user: { id: userId }, todo, status },
      });
    });
  }

  static async createMany(
    ctx: IContext,
    data: Prisma.OnboardingCreateManyInput[],
    tx?: Prisma.TransactionClient,
  ) {
    return tx
      ? tx.onboarding.createMany({ data })
      : this.issuer.public(ctx, (dbTx) => dbTx.onboarding.createMany({ data }));
  }
}
