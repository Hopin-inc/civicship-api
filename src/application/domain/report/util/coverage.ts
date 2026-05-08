import { WeeklyReportPayload } from "@/application/domain/report/types";

/**
 * Per-field coverage analysis result. `value` is the numeric metric
 * pulled from the payload; `mentioned` is true when the stringified
 * value appears as a substring in the generated markdown.
 *
 * Phase 1 trades fidelity for shipability: substring matches will
 * accept "566" inside "5660", and a model that says "five hundred and
 * sixty-six members" gets a false negative. Both are acceptable noise
 * floors for the regression-vs-fabrication signal we want pre-judge.
 * Phase 2 folds coverage analysis into the LLM judge itself, which can
 * read the surrounding context.
 */
export interface CoverageField {
  value: number | null;
  mentioned: boolean;
}

/**
 * Per-top-user name check. `mentioned` is true when the user's `name`
 * appears as a substring in the generated markdown — the LLM is
 * required to copy `top_users[*].name` verbatim, so a missing match
 * here is a strong "fabrication or omission" signal. Empty `name`
 * values (rare; profile lookup miss in the presenter) carry
 * `mentioned: true` so they don't poison the warning aggregation.
 *
 * Same shipability-vs-fidelity tradeoff as `CoverageField`: substring
 * matching has no concept of word boundaries (especially in Japanese,
 * where there isn't a reliable boundary character), so a payload name
 * of "田中" matches an unrelated "田中太郎" in the output and gets
 * flagged `mentioned: true`. The reverse failure (payload "田中" vs.
 * output "田中さん") is the exact case we want to catch, and
 * disambiguating is impossible from the substring alone. The
 * authoritative fidelity check lives in the JUDGE prompt's
 * `fabrication_check.top_user_names` rubric, which reads the surrounding
 * context; this coverage signal is a cheap pre-judge tripwire and is
 * intentionally permissive.
 */
export interface TopUserNameCoverage {
  name: string;
  mentioned: boolean;
}

/**
 * Per-top-user numeric coverage. Each field is true when the
 * corresponding payload value appears as a substring in the markdown,
 * OR when the value is zero / null (no payload value to mention →
 * vacuously satisfied). Numeric substring matches false-positive far
 * more easily than name matches (a "21000" prefix can match "210000"),
 * so the usecase deliberately does NOT log warnings off these fields —
 * they are recorded for offline analysis only.
 */
export interface TopUserPointsCoverage {
  name: string;
  points_in: boolean;
  points_out: boolean;
  donation_out_points: boolean;
}

export interface CoverageJson {
  active_users: CoverageField;
  total_members: CoverageField;
  deepest_chain_depth: CoverageField;
  /**
   * Per-top-user name coverage. Empty when `payload.top_users` is
   * empty (no users to check). Each entry's `mentioned` is the
   * substring lookup against `outputMarkdown` and is the primary
   * signal driving the auto-reject judge prompt.
   */
  top_user_names: TopUserNameCoverage[];
  /**
   * Per-top-user numeric coverage. Same length as `top_user_names`
   * (one entry per `top_users[i]`). Records-only: no warning
   * aggregation lives off these because numeric substring matches
   * carry too much false-positive noise.
   */
  top_user_points: TopUserPointsCoverage[];
}

/**
 * Substring-mention check for headline numeric fields and the top-N
 * users (names + per-user numeric fields).
 *
 * `null` / zero values carry `mentioned: true` by convention — there
 * is no payload string to "mention" in those cases, so flagging them
 * as missed would generate noise. Empty `top_users` collapses
 * `top_user_names` / `top_user_points` to empty arrays for the same
 * reason.
 *
 * Pure function: no logging, no exceptions, no I/O. The caller
 * (judgeAndPersist) decides which misses are worth a warning log
 * based on signal-to-noise; this layer only computes the booleans.
 */
export function analyzeCoverage(
  payload: WeeklyReportPayload,
  output: string,
): CoverageJson {
  const activeUsers = payload.community_context?.active_users_in_window ?? null;
  const totalMembers = payload.community_context?.total_members ?? null;
  const chainDepth = payload.deepest_chain?.chain_depth ?? null;

  const top_user_names: TopUserNameCoverage[] = payload.top_users.map((u) => ({
    name: u.name,
    // Empty name → presenter could not resolve a profile row; treat
    // as vacuously satisfied so it doesn't show up in the warning log.
    mentioned: u.name === "" ? true : output.includes(u.name),
  }));

  const top_user_points: TopUserPointsCoverage[] = payload.top_users.map((u) => ({
    name: u.name,
    // Zero is treated as "nothing to mention" — a user with
    // `points_in: 0` has no incoming-points number that should appear
    // in the markdown, so requiring its substring match would
    // perpetually flag receiver-only / sender-only users.
    points_in: u.points_in === 0 ? true : output.includes(String(u.points_in)),
    points_out: u.points_out === 0 ? true : output.includes(String(u.points_out)),
    donation_out_points:
      u.donation_out_points === 0
        ? true
        : output.includes(String(u.donation_out_points)),
  }));

  return {
    active_users: {
      value: activeUsers,
      mentioned: activeUsers !== null && output.includes(String(activeUsers)),
    },
    total_members: {
      value: totalMembers,
      mentioned: totalMembers !== null && output.includes(String(totalMembers)),
    },
    deepest_chain_depth: {
      value: chainDepth,
      mentioned: chainDepth !== null && output.includes(String(chainDepth)),
    },
    top_user_names,
    top_user_points,
  };
}
