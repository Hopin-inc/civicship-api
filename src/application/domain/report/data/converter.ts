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
      temperature: input.temperature ?? null,
      maxTokens: input.maxTokens,
      stopSequences: input.stopSequences ?? [],
      isEnabled: input.isEnabled ?? true,
      // A/B selection fields (PR-F3). The Prisma defaults are applied on
      // CREATE (isActive=true, trafficWeight=100, experimentKey=null) so we
      // only forward values the caller explicitly provided; on UPDATE the
      // explicit values overwrite any prior state.
      ...(input.isActive !== undefined && input.isActive !== null
        ? { isActive: input.isActive }
        : {}),
      ...(input.trafficWeight !== undefined && input.trafficWeight !== null
        ? { trafficWeight: input.trafficWeight }
        : {}),
      ...(input.experimentKey !== undefined
        ? { experimentKey: input.experimentKey }
        : {}),
    };
  }

  static deriveScope(communityId: string | null | undefined): ReportTemplateScope {
    return communityId ? ReportTemplateScope.COMMUNITY : ReportTemplateScope.SYSTEM;
  }
}
