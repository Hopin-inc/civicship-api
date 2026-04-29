import "reflect-metadata";
import {
  JUDGE_HUMAN_CORRELATION_WARNING_THRESHOLD,
  MIN_PAIRS_FOR_CORRELATION,
  pearsonCorrelation,
} from "@/application/domain/report/feedback/correlation";
import type { JudgeFeedbackPairRow } from "@/application/domain/report/feedback/data/type";

/**
 * Direct unit coverage for the Pearson math, separate from the service
 * orchestration tests. Behavior pinned: short-series → null,
 * zero-variance → null, perfect correlations clamped to ±1, and the
 * 3-pair minimum carried by MIN_PAIRS_FOR_CORRELATION.
 */
describe("pearsonCorrelation", () => {
  function pair(judgeScore: number, avgRating: number): JudgeFeedbackPairRow {
    return { judgeScore, avgRating } as JudgeFeedbackPairRow;
  }

  it("returns null for empty input", () => {
    expect(pearsonCorrelation([])).toBeNull();
  });

  it("returns null with fewer than the minimum pair count", () => {
    expect(pearsonCorrelation([pair(0.5, 3), pair(0.6, 4)])).toBeNull();
  });

  it("returns 1 for a perfectly positive monotonic series", () => {
    const r = pearsonCorrelation([pair(0.1, 1), pair(0.5, 3), pair(0.9, 5)]);
    expect(r).not.toBeNull();
    expect(r!).toBeCloseTo(1, 6);
  });

  it("returns -1 for a perfectly inverse monotonic series", () => {
    const r = pearsonCorrelation([pair(0.1, 5), pair(0.5, 3), pair(0.9, 1)]);
    expect(r).not.toBeNull();
    expect(r!).toBeCloseTo(-1, 6);
  });

  it("returns null when one axis has zero variance (constant judge score)", () => {
    expect(
      pearsonCorrelation([pair(0.5, 1), pair(0.5, 3), pair(0.5, 5)]),
    ).toBeNull();
  });

  it("returns null when one axis has zero variance (constant rating)", () => {
    expect(
      pearsonCorrelation([pair(0.1, 4), pair(0.5, 4), pair(0.9, 4)]),
    ).toBeNull();
  });

  it("clamps rounding-error overshoot to within [-1, 1]", () => {
    // Construct a perfectly correlated series in floats whose intermediate
    // sums could float past 1.0 by ~1e-16 — pinning the clamp behaviour.
    const r = pearsonCorrelation([
      pair(0.1, 0.1 + 1e-9),
      pair(0.2, 0.2 + 1e-9),
      pair(0.3, 0.3 + 1e-9),
    ]);
    expect(r).not.toBeNull();
    expect(r!).toBeLessThanOrEqual(1);
    expect(r!).toBeGreaterThanOrEqual(-1);
  });

  it("uses MIN_PAIRS_FOR_CORRELATION = 3 as the threshold", () => {
    // Pin the constant to its expected value so a future tweak shows up
    // alongside the prose docstring on getTemplateStats / breakdown.
    expect(MIN_PAIRS_FOR_CORRELATION).toBe(3);
  });

  it("exposes JUDGE_HUMAN_CORRELATION_WARNING_THRESHOLD = 0.7", () => {
    expect(JUDGE_HUMAN_CORRELATION_WARNING_THRESHOLD).toBe(0.7);
  });
});
