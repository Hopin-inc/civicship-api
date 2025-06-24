import { GqlQueryVcIssuanceRequestsArgs, GqlQueryVcIssuanceRequestArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import VCIssuanceRequestUseCase from "@/application/domain/experience/evaluation/vcIssuanceRequest/usecase";
import { PrismaVCIssuanceRequestDetail } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/type";

@injectable()
export default class VcIssuanceRequestResolver {
  constructor(
    @inject("VCIssuanceUseCase")
    private readonly usecase: VCIssuanceRequestUseCase,
  ) {}

  Query = {
    vcIssuanceRequests: (_: unknown, args: GqlQueryVcIssuanceRequestsArgs, ctx: IContext) => {
      return this.usecase.visitorBrowseVcIssuanceRequests(ctx, args);
    },

    vcIssuanceRequest: (_: unknown, args: GqlQueryVcIssuanceRequestArgs, ctx: IContext) => {
      return this.usecase.visitorViewVcIssuanceRequest(ctx, args);
    },
  };

  VcIssuanceRequest = {
    evaluation: (parent: PrismaVCIssuanceRequestDetail, _: unknown, ctx: IContext) => {
      return parent.evaluationId ? ctx.loaders.evaluation.load(parent.evaluationId) : null;
    },

    user: (parent: PrismaVCIssuanceRequestDetail, _: unknown, ctx: IContext) => {
      return parent.userId ? ctx.loaders.user.load(parent.userId) : null;
    },
  };
}
