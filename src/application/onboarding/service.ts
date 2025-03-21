import { IContext } from "@/types/server";
import OnboardingRepository from "@/application/onboarding/repository";
import { OnboardingStatus, Prisma, Todo } from "@prisma/client";

export default class OnboardingService {
  static async createOnboardingTodos(
    ctx: IContext,
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const todos = Object.values(Todo); // ["PROFILE", "PERSONAL_LOG", ...]
    const data: Prisma.OnboardingCreateManyInput[] = todos.map((todo) => ({
      userId,
      todo,
      status: OnboardingStatus.WIP,
    }));

    await OnboardingRepository.createMany(ctx, data, tx);
  }

  static async hasWipOnboardingTodo(ctx: IContext, userId: string, todo: Todo): Promise<boolean> {
    const todoItem = await OnboardingRepository.find(ctx, userId, todo, OnboardingStatus.WIP);
    return todoItem !== null;
  }
}
