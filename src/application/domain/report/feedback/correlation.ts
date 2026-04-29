import { JudgeFeedbackPairRow } from "@/application/domain/report/feedback/data/type";

/**
 * Threshold below which judge scores are no longer a reliable proxy for
 * perceived quality. Flagged via `correlationWarning=true` in the stats
 * response so ops can re-calibrate the judge prompt. The number is not
 * sacred — pulled from the design doc — but kept as a named constant so
 * every layer (service, test) shares one source of truth.
 */
export const JUDGE_HUMAN_CORRELATION_WARNING_THRESHOLD = 0.7;

/**
 * Minimum number of (judgeScore, rating) pairs required before Pearson's
 * r is computed. Fewer than two pairs has no variance; with only two
 * points the correlation is always ±1 and carries no signal. Return null
 * below this threshold rather than emitting misleading values.
 */
export const MIN_PAIRS_FOR_CORRELATION = 3;

/**
 * Pearson's product-moment correlation coefficient for a paired
 * (judgeScore, avgRating) series. Returns `null` when the series is too
 * short or either axis has zero variance (both produce a division by zero
 * in the classical formula — null is safer than NaN at the GraphQL
 * boundary). Consumers should go through `ReportFeedbackService.getTemplateStats`
 * rather than calling this directly; exported so the math has its own
 * unit-test entry point and so the breakdown path can reuse the same
 * implementation as the single-row stats path.
 */
export function pearsonCorrelation(pairs: JudgeFeedbackPairRow[]): number | null {
  if (pairs.length < MIN_PAIRS_FOR_CORRELATION) return null;

  const n = pairs.length;
  const meanX = pairs.reduce((s, p) => s + p.judgeScore, 0) / n;
  const meanY = pairs.reduce((s, p) => s + p.avgRating, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;
  for (const p of pairs) {
    const dx = p.judgeScore - meanX;
    const dy = p.avgRating - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const denom = Math.sqrt(denX * denY);
  if (denom === 0) return null;

  const r = num / denom;
  // Clamp to [-1, 1]; rounding error can push a mathematically ±1 series
  // over the boundary by ~1e-16, which is ugly in the response.
  if (r > 1) return 1;
  if (r < -1) return -1;
  return r;
}
