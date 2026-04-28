import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import ReportFeedbackUseCase from "@/application/domain/report/feedback/usecase";
import {
  GqlMutationSubmitReportFeedbackArgs,
  GqlQueryReportTemplateStatsArgs,
  GqlQueryReportTemplateStatsBreakdownArgs,
} from "@/types/graphql";
import { PrismaReport } from "@/application/domain/report/data/type";
import { PrismaReportFeedback } from "@/application/domain/report/feedback/data/type";

@injectable()
export default class ReportFeedbackResolver {
  constructor(@inject("ReportFeedbackUseCase") private readonly useCase: ReportFeedbackUseCase) {}

  Query = {
    reportTemplateStats: (_: unknown, args: GqlQueryReportTemplateStatsArgs, ctx: IContext) => {
      return this.useCase.viewReportTemplateStats(args, ctx);
    },
    reportTemplateStatsBreakdown: (
      _: unknown,
      args: GqlQueryReportTemplateStatsBreakdownArgs,
      ctx: IContext,
    ) => {
      return this.useCase.viewReportTemplateStatsBreakdown(args, ctx);
    },
  };

  Mutation = {
    submitReportFeedback: (
      _: unknown,
      args: GqlMutationSubmitReportFeedbackArgs,
      ctx: IContext,
    ) => {
      return this.useCase.submitReportFeedback(args, ctx);
    },
  };

  /**
   * Field resolvers grafted onto the existing `Report` type. Extending
   * the resolver map in a separate file means the main report resolver
   * does not grow a feedback dependency — the GraphQL runtime merges
   * the two `Report` resolver objects when the schema is assembled.
   *
   * `myFeedback` is routed through the per-request DataLoader so a
   * `reports { myFeedback }` query collapses to one Prisma round trip
   * per distinct caller userId rather than one per Report. The loader
   * key is `{ reportId, userId }`; we pass the caller's userId at load
   * time because the loader factory runs before auth in the request
   * lifecycle.
   */
  Report = {
    feedbacks: (
      parent: PrismaReport,
      args: { first?: number | null; after?: string | null },
      ctx: IContext,
    ) => this.useCase.listFeedbacksForReport(ctx, parent.id, args),
    myFeedback: (parent: PrismaReport, _: unknown, ctx: IContext) => {
      const userId = ctx.currentUser?.id;
      if (!userId) return null;
      return ctx.loaders.myReportFeedback.load({ reportId: parent.id, userId });
    },
  };

  ReportFeedback = {
    user: (parent: PrismaReportFeedback, _: unknown, ctx: IContext) =>
      ctx.loaders.user.load(parent.userId),
  };

  SubmitReportFeedbackPayload = { __resolveType: (obj: { __typename: string }) => obj.__typename };
}
