import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import ReportUseCase from "@/application/domain/report/usecase";
import {
  GqlMutationGenerateReportArgs,
  GqlMutationUpdateReportTemplateArgs,
  GqlMutationApproveReportArgs,
  GqlMutationPublishReportArgs,
  GqlMutationRejectReportArgs,
  GqlQueryReportsArgs,
  GqlQueryReportArgs,
  GqlQueryReportTemplateArgs,
  GqlQueryReportTemplatesArgs,
  GqlQueryAdminBrowseReportsArgs,
  GqlQueryAdminReportSummaryArgs,
} from "@/types/graphql";
import { PrismaReport } from "@/application/domain/report/data/type";

@injectable()
export default class ReportResolver {
  constructor(@inject("ReportUseCase") private readonly useCase: ReportUseCase) {}

  Query = {
    reports: (_: unknown, args: GqlQueryReportsArgs, ctx: IContext) => {
      return this.useCase.browseReports(args, ctx);
    },
    report: (_: unknown, args: GqlQueryReportArgs, ctx: IContext) => {
      return this.useCase.viewReport(args, ctx);
    },
    reportTemplate: (_: unknown, args: GqlQueryReportTemplateArgs, ctx: IContext) => {
      return this.useCase.viewReportTemplate(args, ctx);
    },
    reportTemplates: (_: unknown, args: GqlQueryReportTemplatesArgs, ctx: IContext) => {
      return this.useCase.listReportTemplates(args, ctx);
    },
    adminBrowseReports: (_: unknown, args: GqlQueryAdminBrowseReportsArgs, ctx: IContext) => {
      return this.useCase.adminBrowseReports(args, ctx);
    },
    adminReportSummary: (_: unknown, args: GqlQueryAdminReportSummaryArgs, ctx: IContext) => {
      return this.useCase.adminViewReportSummary(args, ctx);
    },
  };

  Mutation = {
    generateReport: (_: unknown, args: GqlMutationGenerateReportArgs, ctx: IContext) => {
      return this.useCase.generateReport(args, ctx);
    },
    updateReportTemplate: (
      _: unknown,
      args: GqlMutationUpdateReportTemplateArgs,
      ctx: IContext,
    ) => {
      return this.useCase.updateReportTemplate(args, ctx);
    },
    approveReport: (_: unknown, args: GqlMutationApproveReportArgs, ctx: IContext) => {
      return this.useCase.approveReport(args, ctx);
    },
    publishReport: (_: unknown, args: GqlMutationPublishReportArgs, ctx: IContext) => {
      return this.useCase.publishReport(args, ctx);
    },
    rejectReport: (_: unknown, args: GqlMutationRejectReportArgs, ctx: IContext) => {
      return this.useCase.rejectReport(args, ctx);
    },
  };

  Report = {
    community: (parent: PrismaReport, _: unknown, ctx: IContext) =>
      ctx.loaders.community.load(parent.communityId),
    template: (parent: PrismaReport, _: unknown, ctx: IContext) => {
      if (!(ctx.isAdmin || ctx.currentUser?.sysRole === "SYS_ADMIN")) return null;
      return parent.templateId ? ctx.loaders.reportTemplate.load(parent.templateId) : null;
    },
    generatedByUser: (parent: PrismaReport, _: unknown, ctx: IContext) =>
      parent.generatedBy ? ctx.loaders.user.load(parent.generatedBy) : null,
    publishedByUser: (parent: PrismaReport, _: unknown, ctx: IContext) =>
      parent.publishedBy ? ctx.loaders.user.load(parent.publishedBy) : null,
    targetUser: (parent: PrismaReport, _: unknown, ctx: IContext) =>
      parent.targetUserId ? ctx.loaders.user.load(parent.targetUserId) : null,
    parentRun: (parent: PrismaReport, _: unknown, ctx: IContext) =>
      parent.parentRunId ? ctx.loaders.report.load(parent.parentRunId) : null,
    regenerations: (parent: PrismaReport, _: unknown, ctx: IContext) =>
      ctx.loaders.reportsByParentRunId.load(parent.id),
  };

  ReportTemplate = {
    community: (parent: { communityId: string | null }, _: unknown, ctx: IContext) =>
      parent.communityId ? ctx.loaders.community.load(parent.communityId) : null,
    updatedByUser: (parent: { updatedBy: string | null }, _: unknown, ctx: IContext) =>
      parent.updatedBy ? ctx.loaders.user.load(parent.updatedBy) : null,
  };

  /**
   * Field resolvers for `AdminReportSummaryRow`. The presenter only
   * threads the relation ids (`communityId` / `lastPublishedReportId`)
   * onto the parent — these resolvers hydrate the actual Community /
   * Report objects via existing dataloaders so a 50-row page issues
   * at most two batched lookups regardless of how many distinct
   * communities show up.
   */
  AdminReportSummaryRow = {
    community: (parent: { communityId: string }, _: unknown, ctx: IContext) =>
      ctx.loaders.community.load(parent.communityId),
    lastPublishedReport: (
      parent: { lastPublishedReportId: string | null },
      _: unknown,
      ctx: IContext,
    ) =>
      parent.lastPublishedReportId
        ? ctx.loaders.report.load(parent.lastPublishedReportId)
        : null,
  };

  GenerateReportPayload = { __resolveType: (obj: { __typename: string }) => obj.__typename };
  UpdateReportTemplatePayload = { __resolveType: (obj: { __typename: string }) => obj.__typename };
  ApproveReportPayload = { __resolveType: (obj: { __typename: string }) => obj.__typename };
  PublishReportPayload = { __resolveType: (obj: { __typename: string }) => obj.__typename };
  RejectReportPayload = { __resolveType: (obj: { __typename: string }) => obj.__typename };
}
