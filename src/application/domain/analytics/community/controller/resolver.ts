import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import AnalyticsCommunityUseCase, {
  AnalyticsCommunityRoot,
} from "@/application/domain/analytics/community/usecase";
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

  // Field resolvers run lazily per the client's selection set. The
  // scalar fields (communityId, communityName, asOf, windowMonths) live
  // directly on the root the Query resolver returns, so GraphQL's
  // default resolver serves them without a field resolver here.
  AnalyticsCommunityPayload = {
    summary: (parent: AnalyticsCommunityRoot, _: unknown, ctx: IContext) =>
      this.useCase.summary(parent, ctx),
    stages: (parent: AnalyticsCommunityRoot) => this.useCase.stages(parent),
    monthlyActivityTrend: (parent: AnalyticsCommunityRoot) =>
      this.useCase.monthlyActivityTrend(parent),
    retentionTrend: (parent: AnalyticsCommunityRoot, _: unknown, ctx: IContext) =>
      this.useCase.retentionTrend(parent, ctx),
    cohortRetention: (parent: AnalyticsCommunityRoot, _: unknown, ctx: IContext) =>
      this.useCase.cohortRetention(parent, ctx),
    memberList: (parent: AnalyticsCommunityRoot) => this.useCase.memberList(parent),
    alerts: (parent: AnalyticsCommunityRoot, _: unknown, ctx: IContext) =>
      this.useCase.alerts(parent, ctx),
    dormantCount: (parent: AnalyticsCommunityRoot) => this.useCase.dormantCount(parent),
    chainDepthDistribution: (parent: AnalyticsCommunityRoot, _: unknown, ctx: IContext) =>
      this.useCase.chainDepthDistribution(parent, ctx),
    cohortFunnel: (parent: AnalyticsCommunityRoot) => this.useCase.cohortFunnel(parent),
    hubMemberCount: (parent: AnalyticsCommunityRoot, _: unknown, ctx: IContext) =>
      this.useCase.hubMemberCount(parent, ctx),
    tenureDistribution: (parent: AnalyticsCommunityRoot) =>
      this.useCase.tenureDistribution(parent),
  };
}
