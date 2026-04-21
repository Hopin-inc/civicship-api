import { IContext } from "@/types/server";
import {
  SysAdminAllTimeTotalsRow,
  SysAdminCommunityRow,
  SysAdminMemberStatsRow,
  SysAdminActivitySnapshotRow,
  SysAdminMonthlyActivityRow,
  SysAdminNewMemberCountRow,
  SysAdminPlatformTotalsRow,
} from "@/application/domain/sysadmin/data/type";

/**
 * Repository contract for the sysadmin analytics surface.
 *
 * All queries read through `ctx.issuer.public` (MVs bypass RLS anyway,
 * and the t_memberships / t_transactions reads here are gated at the
 * resolver with `@authz(rules: [IsAdmin])`). No method mutates state.
 */
export interface ISysAdminRepository {
  /** Every community id + display name, ordered by name. */
  findAllCommunities(ctx: IContext): Promise<SysAdminCommunityRow[]>;

  /**
   * Resolve one community by id, returning the same projection shape
   * as `findAllCommunities`. Returns null when the id is unknown so
   * the usecase can surface a NotFoundError without a fallback scan.
   */
  findCommunityById(
    ctx: IContext,
    communityId: string,
  ): Promise<SysAdminCommunityRow | null>;

  /**
   * Per-member LTV-variable counters at `asOf` for one community.
   * Scoped to `status='JOINED'`. A member with zero DONATION-outs is
   * still present (donationOutMonths=0, userSendRate=0, latent stage).
   */
  findMemberStats(
    ctx: IContext,
    communityId: string,
    asOf: Date,
  ): Promise<SysAdminMemberStatsRow[]>;

  /**
   * Monthly activity series for `windowMonths` trailing JST months
   * ending at `asOf`. One row per month with data; months with zero
   * senders and zero new members are still emitted (with zero
   * counters) so the UI can render a contiguous x-axis.
   */
  findMonthlyActivity(
    ctx: IContext,
    communityId: string,
    asOf: Date,
    windowMonths: number,
  ): Promise<SysAdminMonthlyActivityRow[]>;

  /**
   * Latest-month unique sender count + total_members snapshot used to
   * compute `communityActivityRate` and power growth-rate math.
   */
  findActivitySnapshot(
    ctx: IContext,
    communityId: string,
    jstMonthStart: Date,
    jstNextMonthStart: Date,
  ): Promise<SysAdminActivitySnapshotRow>;

  /**
   * Count of `t_memberships.status='JOINED'` rows whose `created_at`
   * falls within `[from, to)`. Used for the `no_new_members` alert.
   */
  findNewMemberCount(
    ctx: IContext,
    communityId: string,
    from: Date,
    to: Date,
  ): Promise<SysAdminNewMemberCountRow>;

  /** All-time DONATION totals + MV data window for the summary card,
   * clamped at `asOf` for historic-asOf consistency with the rest of
   * the dashboard. */
  findAllTimeTotals(
    ctx: IContext,
    communityId: string,
    asOf: Date,
  ): Promise<SysAdminAllTimeTotalsRow>;

  /** Platform-wide headline row for the L1 dashboard. */
  findPlatformTotals(
    ctx: IContext,
    jstMonthStart: Date,
    jstNextMonthStart: Date,
  ): Promise<SysAdminPlatformTotalsRow>;
}
