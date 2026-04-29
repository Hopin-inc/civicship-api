import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { IAnalyticsPlatformRepository } from "@/application/domain/analytics/platform/data/interface";

@injectable()
export default class AnalyticsPlatformService {
  constructor(
    @inject("AnalyticsPlatformRepository")
    private readonly repository: IAnalyticsPlatformRepository,
  ) {}

  async getPlatformTotals(ctx: IContext, jstMonthStart: Date, jstNextMonthStart: Date) {
    return this.repository.findPlatformTotals(ctx, jstMonthStart, jstNextMonthStart);
  }
}
