import { Prisma, ReportStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  CommunitySummaryCursor,
  PrismaReport,
} from "@/application/domain/report/data/type";

/**
 * Report-entity repository contract: CRUD against `t_reports` plus
 * the cross-community admin summary surface and judge-result update.
 *
 * Aggregations / materialized-view refreshes live in the
 * `transactionStats/` subdomain; template + golden-case CRUD lives
 * in the `template/` subdomain. Each subdomain ships its own repository
 * + interface so callers (resolvers, services, tests) only depend on
 * the slice they actually use.
 */
export interface IReportRepository {
  createReport(
    ctx: IContext,
    data: Prisma.ReportUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport>;
  findReportById(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport | null>;
  findReports(
    ctx: IContext,
    params: {
      communityId: string;
      variant?: string;
      status?: ReportStatus;
      cursor?: string;
      first?: number;
    },
  ): Promise<{ items: PrismaReport[]; totalCount: number }>;
  findAllReports(
    ctx: IContext,
    params: {
      communityId?: string;
      status?: ReportStatus;
      variant?: string;
      publishedAfter?: Date;
      publishedBefore?: Date;
      cursor?: string;
      first: number;
    },
  ): Promise<{ items: PrismaReport[]; totalCount: number }>;
  findCommunityReportSummary(
    ctx: IContext,
    params: { cursor: CommunitySummaryCursor | null; first: number },
  ): Promise<{
    items: Array<{
      communityId: string;
      lastPublishedReportId: string | null;
      lastPublishedAt: Date | null;
      publishedCountLast90Days: number;
    }>;
    totalCount: number;
  }>;
  recalculateCommunityLastPublished(
    ctx: IContext,
    communityId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void>;
  updateReportStatus(
    ctx: IContext,
    id: string,
    status: ReportStatus,
    extra?: {
      publishedAt?: Date;
      publishedBy?: string;
      finalContent?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport>;
  findReportsByParentRunId(ctx: IContext, parentRunIds: string[]): Promise<PrismaReport[]>;
  updateReportJudgeResult(
    ctx: IContext,
    id: string,
    data: {
      judgeScore: number | null;
      judgeBreakdown: Prisma.InputJsonValue | null;
      judgeTemplateId: string | null;
      coverageJson: Prisma.InputJsonValue | null;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReport>;
}
