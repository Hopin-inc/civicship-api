import { ReportTemplateKind } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { NotFoundError } from "@/errors/graphql";
import { IReportRepository } from "@/application/domain/report/data/interface";
import { PrismaReportTemplate } from "@/application/domain/report/data/type";
import { truncateToJstDate } from "@/application/domain/report/util";

/**
 * Resolves a `ReportTemplate` for a (variant, kind, community) triple with
 * support for concurrent A/B candidates.
 *
 * Selection order:
 *   1. COMMUNITY-scope candidates (isEnabled=true AND isActive=true), if any.
 *   2. Otherwise, SYSTEM-scope candidates with the same filter.
 *
 * When more than one candidate matches, the winner is chosen by a
 * `trafficWeight`-weighted draw whose seed is derived from
 * `${communityId}-${isoWeekStartJst}`. This keeps the selection
 * *deterministic within a given community + ISO week* — a manager regenerating
 * their weekly report mid-week sees the same variant, not a fresh coin flip —
 * while still rotating candidates week-over-week so the distribution
 * converges on the intended `trafficWeight` split over time.
 */
@injectable()
export default class ReportTemplateSelector {
  constructor(
    @inject("ReportRepository") private readonly repository: IReportRepository,
  ) {}

  async selectTemplate(
    ctx: IContext,
    variant: string,
    kind: ReportTemplateKind,
    communityId: string,
    referenceDate: Date,
  ): Promise<PrismaReportTemplate> {
    const communityCandidates = await this.repository.findActiveTemplates(
      ctx,
      variant,
      kind,
      communityId,
    );
    const candidates =
      communityCandidates.length > 0
        ? communityCandidates
        : await this.repository.findActiveTemplates(ctx, variant, kind, null);

    if (candidates.length === 0) {
      // Surface as NOT_FOUND so the GraphQL boundary exposes a structured
      // error code (rather than the opaque INTERNAL_SERVER_ERROR that a
      // plain `Error` produces). Seed data always ships at least a SYSTEM
      // template for every (variant, kind), so hitting this path means a
      // deployment/config problem worth bubbling up clearly.
      //
      // `formatError` in presentation/graphql/server.ts only `logger.error`s
      // codes of `INTERNAL_SERVER_ERROR` — a NOT_FOUND response would sail
      // past that gate silently. Log explicitly here so this *server-side*
      // misconfiguration still reaches Cloud Logging and any alerting
      // subscribed to `report.template.missing`, even though the client
      // sees a structured 4xx-style response.
      logger.error("report.template.missing", { variant, kind, communityId });
      throw new NotFoundError("ReportTemplate", { variant, kind, communityId });
    }

    const selected =
      candidates.length === 1
        ? candidates[0]
        : this.weightedRandom(candidates, communityId, referenceDate);

    // Structured-meta form: winston's json() formatter promotes each field
    // to a top-level key in Cloud Logging so queries like
    // `jsonPayload.variant="WEEKLY_SUMMARY"` work. A single `JSON.stringify`
    // would collapse everything into an opaque `message` string. `event`
    // is duplicated into the metadata so existing dashboards/alerts that
    // match on `jsonPayload.event` continue to work regardless of how the
    // log ingestion pipeline maps the winston `message` field.
    logger.info("report.template.selected", {
      event: "report.template.selected",
      variant,
      kind,
      communityId,
      selectedTemplateId: selected.id,
      selectedVersion: selected.version,
      selectedScope: selected.scope,
      candidateCount: candidates.length,
      isAbTest: candidates.length > 1,
    });

    return selected;
  }

  /**
   * Weighted draw over `templates` using `trafficWeight`. The seed is
   * `cyrb53(${communityId}-${isoWeekStartJst})`, so the *same* community
   * resolves to the *same* template for every call within a given JST ISO
   * week — even across regenerations. Templates are first sorted by id so the
   * weight-accumulation order is stable regardless of DB result order
   * (otherwise a row re-ordering in Postgres could flip the selection for the
   * same seed).
   */
  private weightedRandom(
    templates: PrismaReportTemplate[],
    communityId: string,
    referenceDate: Date,
  ): PrismaReportTemplate {
    const weekStart = isoWeekStartJst(referenceDate);
    const seed = cyrb53(`${communityId}-${weekStart.toISOString().slice(0, 10)}`);

    const sorted = [...templates].sort((a, b) => a.id.localeCompare(b.id));
    const weights = sorted.map((t) => (t.trafficWeight > 0 ? t.trafficWeight : 0));
    const total = weights.reduce((s, w) => s + w, 0);

    // Degenerate: every candidate has weight 0. Fall back to the first
    // (deterministic by id) rather than erroring — the situation is
    // recoverable by fixing seed data, and the caller still gets a valid
    // template snapshot.
    if (total === 0) return sorted[0];

    let rand = seed % total;
    for (let i = 0; i < sorted.length; i++) {
      if (rand < weights[i]) return sorted[i];
      rand -= weights[i];
    }
    return sorted[sorted.length - 1];
  }
}

/**
 * Monday (00:00 JST) of the ISO week containing `d`, encoded as a
 * UTC-midnight Date whose year/month/day match the JST calendar date (the
 * same convention used by `truncateToJstDate`).
 */
function isoWeekStartJst(d: Date): Date {
  const jstDay = truncateToJstDate(d);
  const dow = jstDay.getUTCDay(); // 0=Sun..6=Sat
  const daysSinceMonday = (dow + 6) % 7;
  return new Date(jstDay.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000);
}

/**
 * cyrb53: a fast, non-cryptographic 53-bit string hash. Used only as a
 * deterministic PRNG seed for weighted A/B selection — no security
 * properties relied on. Lifted verbatim from the canonical reference
 * (bryc/code-snippets on GitHub, public domain).
 */
export function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
