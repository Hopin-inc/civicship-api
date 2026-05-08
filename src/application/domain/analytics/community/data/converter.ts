/**
 * Wire-format → internal form for the analytics domain. Pure GraphQL
 * input-side transforms only. The matching internal → GraphQL
 * output direction (e.g. encoding the next-page cursor) lives in
 * the presenter to keep each layer's transform direction clean.
 */
export default class AnalyticsCommunityConverter {
  /**
   * Decode the opaque base64 cursor a `paginateMembers` caller hands
   * back from a previous page. The wire format is the offset
   * stringified and base64-encoded — opaque to clients but trivial
   * to reverse here. Returns 0 on garbage so a tampered cursor
   * collapses to "first page" instead of throwing.
   */
  static parseMemberListCursor(cursor: string | null | undefined): number {
    if (!cursor) return 0;
    try {
      const decoded = Buffer.from(cursor, "base64").toString("utf8");
      const n = Number.parseInt(decoded, 10);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    } catch {
      return 0;
    }
  }
}
