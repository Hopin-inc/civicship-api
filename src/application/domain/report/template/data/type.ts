import { Prisma } from "@prisma/client";

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

export type PrismaReportTemplate = Prisma.ReportTemplateGetPayload<{
  select: typeof reportTemplateSelect;
}>;

export type PrismaReportGoldenCase = Prisma.ReportGoldenCaseGetPayload<{
  select: typeof reportGoldenCaseSelect;
}>;
