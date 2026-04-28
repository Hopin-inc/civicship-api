import { Prisma } from "@prisma/client";

export const reportSelect = Prisma.validator<Prisma.ReportSelect>()({
  id: true,
  communityId: true,
  variant: true,
  periodFrom: true,
  periodTo: true,
  templateId: true,
  inputPayload: true,
  outputMarkdown: true,
  model: true,
  systemPromptSnapshot: true,
  userPromptSnapshot: true,
  communityContextSnapshot: true,
  inputTokens: true,
  outputTokens: true,
  cacheReadTokens: true,
  judgeScore: true,
  judgeBreakdown: true,
  judgeTemplateId: true,
  coverageJson: true,
  targetUserId: true,
  generatedBy: true,
  status: true,
  skipReason: true,
  publishedAt: true,
  publishedBy: true,
  finalContent: true,
  regenerateCount: true,
  parentRunId: true,
  createdAt: true,
  updatedAt: true,
});

export type PrismaReport = Prisma.ReportGetPayload<{
  select: typeof reportSelect;
}>;

export const reportTemplateSelect = Prisma.validator<Prisma.ReportTemplateSelect>()({
  id: true,
  variant: true,
  scope: true,
  kind: true,
  communityId: true,
  systemPrompt: true,
  userPromptTemplate: true,
  communityContext: true,
  model: true,
  temperature: true,
  maxTokens: true,
  stopSequences: true,
  isEnabled: true,
  version: true,
  isActive: true,
  experimentKey: true,
  trafficWeight: true,
  notes: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const reportGoldenCaseSelect = Prisma.validator<Prisma.ReportGoldenCaseSelect>()({
  id: true,
  variant: true,
  label: true,
  payloadFixture: true,
  judgeCriteria: true,
  minJudgeScore: true,
  forbiddenKeys: true,
  notes: true,
  expectedStatus: true,
  templateVersion: true,
  createdAt: true,
  updatedAt: true,
});

export type PrismaReportGoldenCase = Prisma.ReportGoldenCaseGetPayload<{
  select: typeof reportGoldenCaseSelect;
}>;

export type PrismaReportTemplate = Prisma.ReportTemplateGetPayload<{
  select: typeof reportTemplateSelect;
}>;

/**
 * Composite cursor for `findCommunityReportSummary`. The query sorts
 * by `(last_published_report_at ASC NULLS FIRST, id ASC)`, so a
 * stable cursor over a non-unique primary key needs both halves of
 * the tuple. `at` is the ISO timestamp string (or null for the
 * dormant tier where the community has never published); `id` is
 * the tie-breaker. The wire format (base64url JSON) is owned by the
 * converter (decode) and presenter (encode) layers — this type is
 * the structured form Repository / Service operate on.
 */
export interface CommunitySummaryCursor {
  at: string | null;
  id: string;
}
