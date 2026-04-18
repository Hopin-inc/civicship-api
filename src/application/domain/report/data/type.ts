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
  communityId: true,
  systemPrompt: true,
  userPromptTemplate: true,
  communityContext: true,
  model: true,
  temperature: true,
  maxTokens: true,
  stopSequences: true,
  isEnabled: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
});

export type PrismaReportTemplate = Prisma.ReportTemplateGetPayload<{
  select: typeof reportTemplateSelect;
}>;
