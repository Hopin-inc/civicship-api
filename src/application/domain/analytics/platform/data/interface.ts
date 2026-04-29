import { IContext } from "@/types/server";
import { AnalyticsPlatformTotalsRow } from "@/application/domain/analytics/platform/data/type";

/**
 * Platform-wide repository contract for the analytics dashboard.
 * Currently a single method (`findPlatformTotals`); kept as its own
 * interface so callers (analytics/usecase.ts dashboard orchestrator)
 * can inject just the platform slice without dragging community-level
 * SQL with it.
 */
export interface IAnalyticsPlatformRepository {
  findPlatformTotals(
    ctx: IContext,
    jstMonthStart: Date,
    jstNextMonthStart: Date,
  ): Promise<AnalyticsPlatformTotalsRow>;
}
