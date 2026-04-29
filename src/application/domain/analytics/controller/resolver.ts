import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import AnalyticsUseCase from "@/application/domain/analytics/usecase";
import { GqlQueryAnalyticsDashboardArgs } from "@/types/graphql";

@injectable()
export default class AnalyticsResolver {
  constructor(@inject("AnalyticsUseCase") private readonly useCase: AnalyticsUseCase) {}

  Query = {
    analyticsDashboard: (
      _: unknown,
      args: GqlQueryAnalyticsDashboardArgs,
      ctx: IContext,
    ) => this.useCase.getDashboard(args, ctx),
  };
}
