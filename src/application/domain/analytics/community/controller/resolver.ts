import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import AnalyticsCommunityUseCase from "@/application/domain/analytics/community/usecase";
import { GqlQueryAnalyticsCommunityArgs } from "@/types/graphql";

@injectable()
export default class AnalyticsCommunityResolver {
  constructor(
    @inject("AnalyticsCommunityUseCase") private readonly useCase: AnalyticsCommunityUseCase,
  ) {}

  Query = {
    analyticsCommunity: (
      _: unknown,
      args: GqlQueryAnalyticsCommunityArgs,
      ctx: IContext,
    ) => this.useCase.getCommunity(args, ctx),
  };
}
