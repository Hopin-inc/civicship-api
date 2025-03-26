import { OnboardingStatus, Prisma } from "@prisma/client";

export default class OnboardingConverter {
  static setDone(): Prisma.OnboardingUpdateInput {
    return {
      status: OnboardingStatus.DONE,
      completedAt: new Date(),
    };
  }
}
