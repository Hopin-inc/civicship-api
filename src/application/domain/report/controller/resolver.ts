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
    template: (parent: PrismaReport, _: unknown, ctx: IContext) =>
      parent.templateId ? ctx.loaders.reportTemplate.load(parent.templateId) : null,
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

  GenerateReportPayload = { __resolveType: (obj: { __typename: string }) => obj.__typename };
  UpdateReportTemplatePayload = { __resolveType: (obj: { __typename: string }) => obj.__typename };
  ApproveReportPayload = { __resolveType: (obj: { __typename: string }) => obj.__typename };
  PublishReportPayload = { __resolveType: (obj: { __typename: string }) => obj.__typename };
  RejectReportPayload = { __resolveType: (obj: { __typename: string }) => obj.__typename };
}
