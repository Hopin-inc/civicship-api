import { Prisma, ReportTemplateScope } from "@prisma/client";
import { GqlUpdateReportTemplateInput } from "@/types/graphql";

export default class ReportConverter {
  static toReportTemplateUpsertData(
    input: GqlUpdateReportTemplateInput,
  ): Omit<Prisma.ReportTemplateCreateInput, "variant" | "scope" | "community"> {
    return {
      systemPrompt: input.systemPrompt,
      userPromptTemplate: input.userPromptTemplate,
      communityContext: input.communityContext ?? null,
      model: input.model,
      temperature: input.temperature ?? 1.0,
      maxTokens: input.maxTokens,
      stopSequences: input.stopSequences ?? [],
      isEnabled: input.isEnabled ?? true,
    };
  }

  static deriveScope(communityId: string | null | undefined): ReportTemplateScope {
    return communityId ? ReportTemplateScope.COMMUNITY : ReportTemplateScope.SYSTEM;
  }
}
