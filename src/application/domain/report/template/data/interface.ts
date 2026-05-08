import { Prisma, ReportStatus, ReportTemplateKind } from "@prisma/client";
import { IContext } from "@/types/server";
import {
  PrismaReportGoldenCase,
  PrismaReportTemplate,
} from "@/application/domain/report/template/data/type";

/**
 * Template + golden-case repository contract. Scoped to the report
 * template lifecycle (selection / lookup / authoring / CI grading
 * fixtures); the entity / aggregation surfaces live in their own
 * sibling subdomains.
 */
export interface IReportTemplateRepository {
  findTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
  ): Promise<PrismaReportTemplate | null>;
  findTemplateByVersion(
    ctx: IContext,
    variant: string,
    kind: ReportTemplateKind,
    version: number,
    communityId: string | null,
  ): Promise<PrismaReportTemplate | null>;
  findActiveTemplates(
    ctx: IContext,
    variant: string,
    kind: ReportTemplateKind,
    communityId: string | null,
  ): Promise<PrismaReportTemplate[]>;
  findTemplates(
    ctx: IContext,
    variant: string,
    communityId: string | null,
    kind: ReportTemplateKind,
    includeInactive: boolean,
  ): Promise<PrismaReportTemplate[]>;
  findJudgeTemplate(
    ctx: IContext,
    variant: string,
  ): Promise<PrismaReportTemplate | null>;
  upsertTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
    data: Omit<Prisma.ReportTemplateCreateInput, "variant" | "scope" | "community">,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportTemplate>;
  findGoldenCases(
    ctx: IContext,
    options?: { variant?: string; pinnedVersion?: number | null },
  ): Promise<PrismaReportGoldenCase[]>;
  upsertGoldenCase(
    ctx: IContext,
    data: {
      variant: string;
      label: string;
      payloadFixture: Prisma.InputJsonValue;
      judgeCriteria: Prisma.InputJsonValue;
      minJudgeScore: number;
      forbiddenKeys: string[];
      notes?: string | null;
      expectedStatus?: ReportStatus | null;
      templateVersion?: number | null;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportGoldenCase>;
}
