import { IContext } from "@/types/server";
import OnboardingRepository from "@/application/onboarding/data/repository";
import { OnboardingStatus, Prisma, Todo } from "@prisma/client";
import OnboardingConverter from "@/application/onboarding/data/converter";
import { NotFoundError } from "@/errors/graphql";

export default class OnboardingService {
  static async findOnboardingTodoOrThrow(
    ctx: IContext,
    userId: string,
    todo: Todo,
    tx?: Prisma.TransactionClient,
  ) {
    const res = await OnboardingRepository.find(ctx, userId, todo, OnboardingStatus.WIP, tx);
    if (!res) {
      throw new NotFoundError("Onboarding", { userId, todo });
    }
    return res;
  }

  static async createOnboardingTodos(
    ctx: IContext,
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const todos = Object.values(Todo);
    const data: Prisma.OnboardingCreateManyInput[] = todos.map((todo) => ({
      userId,
      todo,
      status: OnboardingStatus.WIP,
    }));

    await OnboardingRepository.createMany(ctx, data, tx);
  }

  static async setDone(ctx: IContext, id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const data = OnboardingConverter.setDone();
    await OnboardingRepository.setDone(ctx, id, data, tx);
  }
}
