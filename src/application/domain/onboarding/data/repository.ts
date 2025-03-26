import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { OnboardingStatus, Prisma, Todo } from "@prisma/client";

export default class OnboardingRepository {
  private static issuer = new PrismaClientIssuer();

  static async find(
    ctx: IContext,
    userId: string,
    todo: Todo,
    status: OnboardingStatus,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.onboarding.findFirst({
        where: {
          user: { id: userId },
          todo,
          status,
        },
      });
    } else {
      return this.issuer.public(ctx, (tx) =>
        tx.onboarding.findFirst({
          where: {
            user: { id: userId },
            todo,
            status,
          },
        }),
      );
    }
  }

  static async createMany(
    ctx: IContext,
    data: Prisma.OnboardingCreateManyInput[],
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.onboarding.createMany({ data });
    } else {
      return this.issuer.public(ctx, (tx) => tx.onboarding.createMany({ data }));
    }
  }

  static async setDone(
    ctx: IContext,
    id: string,
    data: Prisma.OnboardingUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.onboarding.update({
        where: { id },
        data,
      });
    }
    return this.issuer.public(ctx, (tx) =>
      tx.onboarding.update({
        where: { id },
        data,
      }),
    );
  }
}
