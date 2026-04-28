import {
  Prisma,
  ReportStatus,
  ReportTemplateKind,
  ReportTemplateScope,
} from "@prisma/client";
import { injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { IReportTemplateRepository } from "@/application/domain/report/template/data/interface";
import {
  PrismaReportGoldenCase,
  PrismaReportTemplate,
  reportGoldenCaseSelect,
  reportTemplateSelect,
} from "@/application/domain/report/template/data/type";

@injectable()
export default class ReportTemplateRepository implements IReportTemplateRepository {
  async findTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
  ): Promise<PrismaReportTemplate | null> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportTemplate.findFirst({
        where: {
          variant,
          kind: ReportTemplateKind.GENERATION,
          isEnabled: true,
          // Filter on `isActive` too: without it, once multiple versions
          // of the same (variant, kind, scope) coexist — e.g. v1
          // `isActive=true` alongside a v2 shakeout candidate with
          // `isActive=false` — `findFirst` matches both and Postgres
          // picks non-deterministically (see PR-F5 regression report).
          // The production `templateSelector` already filters on
          // `isActive=true`; this method is used by the admin
          // `viewReportTemplate` query and the CI non-pinned path,
          // both of which expect "the live template" semantics.
          isActive: true,
          OR: [...(communityId ? [{ communityId }] : []), { communityId: null }],
        },
        // Primary: prefer the COMMUNITY-scope override when one exists
        // (communityId NULLS LAST under ASC in Postgres, so a non-null
        // community row sorts before the SYSTEM fallback).
        // Secondary: when multiple active versions of the same scope
        // exist (e.g. a planned overlap during a weighted A/B rollout
        // that routes prod through `templateSelector`), pin the
        // single-template admin view to the newest active version
        // rather than a non-deterministic pick.
        orderBy: [{ communityId: "asc" }, { version: "desc" }],
        select: reportTemplateSelect,
      }),
    );
  }

  /**
   * CI-only direct lookup. See `IReportTemplateRepository.findTemplateByVersion`
   * for the contract — ignores `isEnabled` / `isActive` so the Golden
   * Case harness can grade an inactive candidate during the v2
   * shakeout window (PR-F5 §7). Not for production use.
   */
  async findTemplateByVersion(
    ctx: IContext,
    variant: string,
    kind: ReportTemplateKind,
    version: number,
    communityId: string | null,
  ): Promise<PrismaReportTemplate | null> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportTemplate.findFirst({
        where: { variant, kind, version, communityId },
        select: reportTemplateSelect,
      }),
    );
  }

  /**
   * Active candidates for (variant, kind, communityId). Unlike `findTemplate`
   * this does NOT fall back to SYSTEM when `communityId` is non-null — the
   * caller (the selector) must issue a separate SYSTEM query when the
   * community-scoped query returns empty, because it needs to distinguish
   * "community has its own A/B set" from "community uses SYSTEM". Only
   * `isEnabled=true AND isActive=true` rows are returned so deprecated /
   * rolled-back candidates never enter the weighted draw.
   */
  async findActiveTemplates(
    ctx: IContext,
    variant: string,
    kind: ReportTemplateKind,
    communityId: string | null,
  ): Promise<PrismaReportTemplate[]> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportTemplate.findMany({
        where: {
          variant,
          kind,
          communityId,
          isEnabled: true,
          isActive: true,
        },
        orderBy: { id: "asc" },
        select: reportTemplateSelect,
      }),
    );
  }

  /**
   * Admin-list backing for `reportTemplates`. Distinct from
   * `findActiveTemplates` (selector hot path, isActive+isEnabled fixed
   * to true and scoped strictly to `communityId`):
   *
   *   - `communityId === null` returns SYSTEM-only.
   *   - `communityId === X` returns SYSTEM ∪ COMMUNITY(X) so the admin
   *     screen can show "what actually runs for this community" — both
   *     the override row and the SYSTEM fallback the override would
   *     replace — in a single sweep.
   *   - `includeInactive=false` (default) keeps the live filter
   *     `isActive=true AND isEnabled=true` so the screen does not surface
   *     rolled-back / disabled rows by default.
   *   - `includeInactive=true` returns every row regardless of state so
   *     the admin can audit history.
   *
   * Sort is `version DESC, createdAt DESC` so the newest revision lands
   * at the top and same-version rows order by recency. The selector
   * does NOT call this — production runs go through
   * `findActiveTemplates`.
   */
  async findTemplates(
    ctx: IContext,
    variant: string,
    communityId: string | null,
    kind: ReportTemplateKind,
    includeInactive: boolean,
  ): Promise<PrismaReportTemplate[]> {
    // Admin-only path (the GraphQL query carries `IsAdmin`); use the
    // internal issuer for consistency with the other Phase 2 admin
    // reads (`findAllReports`, `findCommunityReportSummary`,
    // `getTemplateBreakdown`). The legacy single-row `findTemplate` /
    // selector hot path `findActiveTemplates` continue to use `public`
    // because they're invoked from non-admin call sites
    // (`reportTemplate(communityId, variant)` is admin-gated but the
    // selector path runs during generate from any community member).
    return ctx.issuer.internal((tx) =>
      tx.reportTemplate.findMany({
        where: {
          variant,
          kind,
          ...(communityId === null
            ? { communityId: null }
            : { OR: [{ communityId }, { communityId: null }] }),
          ...(includeInactive ? {} : { isActive: true, isEnabled: true }),
        },
        orderBy: [{ version: "desc" }, { createdAt: "desc" }],
        select: reportTemplateSelect,
      }),
    );
  }

  /**
   * Resolve the active SYSTEM-scope JUDGE template for a variant.
   * Filters on `isEnabled` AND `isActive` so the F1 versioning bookkeeping
   * also gates judge selection — a JUDGE row marked inactive (e.g. a
   * candidate prompt that is being rolled back) is skipped.
   * `communityId IS NULL` is hardcoded because the application-layer
   * guard rejects COMMUNITY-scope JUDGE templates upstream; encoding the
   * same constraint here means a stray COMMUNITY judge row that
   * somehow gets seeded in the future will not silently take effect.
   */
  async findJudgeTemplate(
    ctx: IContext,
    variant: string,
  ): Promise<PrismaReportTemplate | null> {
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportTemplate.findFirst({
        where: {
          variant,
          kind: ReportTemplateKind.JUDGE,
          communityId: null,
          isEnabled: true,
          isActive: true,
        },
        orderBy: { version: "desc" },
        select: reportTemplateSelect,
      }),
    );
  }

  async findGoldenCases(
    ctx: IContext,
    options: { variant?: string; pinnedVersion?: number | null } = {},
  ): Promise<PrismaReportGoldenCase[]> {
    const { variant, pinnedVersion } = options;
    // Version filter semantics (see ReportGoldenCase.templateVersion comment):
    //   pinnedVersion=N → shared baseline ∪ v{N}-specific cases.
    //   pinnedVersion null/undefined → shared baseline only (matches the
    //   production path where `pnpm ci:report-golden` grades only the
    //   currently active prompt).
    const versionWhere: Prisma.ReportGoldenCaseWhereInput =
      pinnedVersion != null
        ? { OR: [{ templateVersion: null }, { templateVersion: pinnedVersion }] }
        : { templateVersion: null };
    const where: Prisma.ReportGoldenCaseWhereInput = variant
      ? { AND: [{ variant }, versionWhere] }
      : versionWhere;
    return ctx.issuer.public(ctx, (tx) =>
      tx.reportGoldenCase.findMany({
        where,
        select: reportGoldenCaseSelect,
        orderBy: [{ variant: "asc" }, { label: "asc" }],
      }),
    );
  }

  async upsertGoldenCase(
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
  ): Promise<PrismaReportGoldenCase> {
    const doUpsert = (client: Prisma.TransactionClient) =>
      client.reportGoldenCase.upsert({
        where: { variant_label: { variant: data.variant, label: data.label } },
        create: {
          variant: data.variant,
          label: data.label,
          payloadFixture: data.payloadFixture,
          judgeCriteria: data.judgeCriteria,
          minJudgeScore: data.minJudgeScore,
          forbiddenKeys: data.forbiddenKeys,
          notes: data.notes ?? null,
          expectedStatus: data.expectedStatus ?? null,
          templateVersion: data.templateVersion ?? null,
        },
        update: {
          payloadFixture: data.payloadFixture,
          judgeCriteria: data.judgeCriteria,
          minJudgeScore: data.minJudgeScore,
          forbiddenKeys: data.forbiddenKeys,
          notes: data.notes ?? null,
          expectedStatus: data.expectedStatus ?? null,
          templateVersion: data.templateVersion ?? null,
        },
        select: reportGoldenCaseSelect,
      });

    if (tx) return doUpsert(tx);
    return ctx.issuer.internal(doUpsert);
  }

  async upsertTemplate(
    ctx: IContext,
    variant: string,
    communityId: string | null,
    data: Omit<Prisma.ReportTemplateCreateInput, "variant" | "scope" | "community">,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaReportTemplate> {
    const scope = communityId ? ReportTemplateScope.COMMUNITY : ReportTemplateScope.SYSTEM;
    // The admin GraphQL mutation that calls this only edits GENERATION
    // templates (the GqlUpdateReportTemplateInput has no `kind` field).
    // Pin the lookup + create to GENERATION so the JUDGE rows added in
    // PR-F7 cannot be accidentally overwritten when a (variant,
    // communityId) pair has both a GENERATION and a JUDGE row at v1.
    // When an admin path for editing JUDGE templates is added, this
    // method should grow a `kind` parameter and thread it through.
    const kind = ReportTemplateKind.GENERATION;
    // Resolve "the row to update" deterministically across both the
    // multi-version case and the all-inactive edge case:
    //   - Primary sort `isActive desc`: when a v1 active + v2 shakeout
    //     candidate (isActive=false) coexist, the active row wins so
    //     admin edits land on the live template rather than the
    //     shakeout candidate (the original bug motivating this lookup).
    //   - Secondary sort `version desc`: ties within the same isActive
    //     bucket resolve to the newest version — covers both a planned
    //     multi-active A/B overlap (picks the newer active) and the
    //     all-inactive fallback (picks the newest inactive) so an
    //     admin who deactivated every template can still edit the
    //     last-known row without hitting an unrecoverable P2002 on
    //     the version-1 unique constraint.
    const existingWhere = {
      variant,
      communityId,
      kind,
    } as const;
    const existingOrderBy = [
      { isActive: "desc" as const },
      { version: "desc" as const },
    ];
    const doUpsert = async (client: Prisma.TransactionClient) => {
      const existing = await client.reportTemplate.findFirst({
        where: existingWhere,
        orderBy: existingOrderBy,
        select: { id: true },
      });
      if (existing) {
        return client.reportTemplate.update({
          where: { id: existing.id },
          data,
          select: reportTemplateSelect,
        });
      }
      try {
        return await client.reportTemplate.create({
          data: {
            ...data,
            variant,
            scope,
            kind,
            ...(communityId ? { community: { connect: { id: communityId } } } : {}),
          },
          select: reportTemplateSelect,
        });
      } catch (e: unknown) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          const raced = await client.reportTemplate.findFirst({
            where: existingWhere,
            orderBy: existingOrderBy,
            select: { id: true },
          });
          if (raced) {
            return client.reportTemplate.update({
              where: { id: raced.id },
              data,
              select: reportTemplateSelect,
            });
          }
        }
        throw e;
      }
    };

    if (tx) return doUpsert(tx);
    return ctx.issuer.internal(doUpsert);
  }

}
