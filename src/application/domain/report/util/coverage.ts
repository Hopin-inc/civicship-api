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

export interface CoverageJson {
  active_users: CoverageField;
  total_members: CoverageField;
  deepest_chain_depth: CoverageField;
}

/**
 * Substring-mention check for headline numeric fields. `null` `value`s
 * (e.g. no community_context, no deepest_chain) carry `mentioned: false`
 * by convention so the downstream summariser can show "n/a" without
 * special-casing nulls itself.
 */
export function analyzeCoverage(
  payload: WeeklyReportPayload,
  output: string,
): CoverageJson {
  const activeUsers = payload.community_context?.active_users_in_window ?? null;
  const totalMembers = payload.community_context?.total_members ?? null;
  const chainDepth = payload.deepest_chain?.chain_depth ?? null;

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
  };
}
