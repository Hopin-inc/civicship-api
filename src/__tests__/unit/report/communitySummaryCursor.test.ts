import {
  CommunitySummaryCursor,
  encodeCommunitySummaryCursor,
  decodeCommunitySummaryCursor,
} from "@/application/domain/report/data/repository";

describe("CommunitySummaryCursor encoding", () => {
  it("round-trips both NULL-tier and chronological-tier cursors", () => {
    const cases: CommunitySummaryCursor[] = [
      { at: null, id: "comm-dormant" },
      { at: "2026-04-27T14:31:53.000Z", id: "comm-active" },
    ];
    for (const c of cases) {
      const decoded = decodeCommunitySummaryCursor(encodeCommunitySummaryCursor(c));
      expect(decoded).toEqual(c);
    }
  });

  it("returns null on garbage input rather than throwing", () => {
    // Truncated, manually edited, or stale-schema cursors should fall back
    // to a fresh first page rather than 500ing the whole query.
    expect(decodeCommunitySummaryCursor("not-base64!!!")).toBeNull();
    expect(decodeCommunitySummaryCursor("")).toBeNull();
    expect(decodeCommunitySummaryCursor(Buffer.from("[]").toString("base64url"))).toBeNull();
    expect(decodeCommunitySummaryCursor(Buffer.from("{}").toString("base64url"))).toBeNull();
    // `at` must be string or null — numbers / objects rejected.
    const badAt = Buffer.from(JSON.stringify({ at: 0, id: "x" })).toString("base64url");
    expect(decodeCommunitySummaryCursor(badAt)).toBeNull();
  });
});
