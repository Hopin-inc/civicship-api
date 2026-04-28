import { Prisma, ReportTemplateScope } from "@prisma/client";
import { GqlUpdateReportTemplateInput } from "@/types/graphql";
import { CommunitySummaryCursor } from "@/application/domain/report/data/type";

export default class ReportConverter {
  /**
   * Decode the opaque cursor string the GraphQL client hands back as
   * `args.cursor` for `adminReportSummary`. Returns null on garbage
   * (truncated, manually edited, stale-schema, unparseable timestamp)
   * so the repository falls back to a fresh first-page scan instead
   * of 500ing on an SQL cast error.
   *
   * Lives in the converter layer by the project's "GraphQL input →
   * internal form" contract; the matching encode (internal → GraphQL
   * output `edge.cursor`) lives in the presenter to keep each layer's
   * transform direction clean.
   */
  static decodeCommunitySummaryCursor(s: string): CommunitySummaryCursor | null {
    try {
      const parsed = JSON.parse(Buffer.from(s, "base64url").toString("utf8"));
      if (!parsed || typeof parsed !== "object") return null;
      if (typeof parsed.id !== "string") return null;
      if (parsed.at !== null && typeof parsed.at !== "string") return null;
      // Tampered cursor where `at` is a string but not a parseable
      // timestamp (e.g. "", "not-a-date") would otherwise reach
      // Postgres as `${at}::timestamp` and 500.
      if (parsed.at !== null && Number.isNaN(new Date(parsed.at).getTime())) {
        return null;
      }
      return { at: parsed.at, id: parsed.id };
    } catch {
      return null;
    }
  }

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
