import "reflect-metadata";
import { MAX_LIMIT, paginateMembers } from "@/application/domain/analytics/community/pagination";
import type { SysAdminMemberStatsRow } from "@/application/domain/sysadmin/data/type";
import { member } from "@/__tests__/unit/sysadmin/fixtures";

// ========================================================================
// paginateMembers: in-memory filter + sort + slice
// ========================================================================
describe("paginateMembers", () => {
  const baseMembers: SysAdminMemberStatsRow[] = [
    member({ userId: "a", userSendRate: 0.9, monthsIn: 10, donationOutMonths: 9 }),
    member({ userId: "b", userSendRate: 0.5, monthsIn: 8, donationOutMonths: 4 }),
    member({ userId: "c", userSendRate: 0.2, monthsIn: 5, donationOutMonths: 1 }),
    member({ userId: "d", userSendRate: 0, monthsIn: 3, donationOutMonths: 0 }),
  ];

  it("filters on minSendRate (inclusive)", () => {
    const { users } = paginateMembers(baseMembers, {
      minSendRate: 0.5,
      sortField: "SEND_RATE",
      sortOrder: "DESC",
      limit: 50,
    });
    expect(users.map((u) => u.userId)).toEqual(["a", "b"]);
  });

  it("filters on minMonthsIn AND minDonationOutMonths simultaneously", () => {
    const { users } = paginateMembers(baseMembers, {
      minSendRate: 0,
      minMonthsIn: 6,
      minDonationOutMonths: 2,
      sortField: "SEND_RATE",
      sortOrder: "DESC",
      limit: 50,
    });
    // `a` (monthsIn=10, donationOutMonths=9) and `b` (monthsIn=8,
    // donationOutMonths=4) both pass. Default sort is SEND_RATE DESC,
    // so `a` (0.9) ahead of `b` (0.5).
    expect(users.map((u) => u.userId)).toEqual(["a", "b"]);
  });

  it("respects maxSendRate as an inclusive upper bound", () => {
    const { users } = paginateMembers(baseMembers, {
      minSendRate: 0,
      maxSendRate: 0.5,
      sortField: "SEND_RATE",
      sortOrder: "DESC",
      limit: 50,
    });
    // 0.9 is excluded; 0.5, 0.2, 0 included.
    expect(users.map((u) => u.userId)).toEqual(["b", "c", "d"]);
  });

  it("sorts by SEND_RATE DESC by default and paginates via cursor", () => {
    const page1 = paginateMembers(baseMembers, {
      minSendRate: 0,
      sortField: "SEND_RATE",
      sortOrder: "DESC",
      limit: 2,
    });
    expect(page1.users.map((u) => u.userId)).toEqual(["a", "b"]);
    expect(page1.hasNextPage).toBe(true);
    expect(page1.nextOffset).not.toBeNull();

    const page2 = paginateMembers(baseMembers, {
      minSendRate: 0,
      sortField: "SEND_RATE",
      sortOrder: "DESC",
      limit: 2,
      cursor: page1.nextOffset!,
    });
    expect(page2.users.map((u) => u.userId)).toEqual(["c", "d"]);
    expect(page2.hasNextPage).toBe(false);
    expect(page2.nextOffset).toBeNull();
  });

  it("sorts by MONTHS_IN ASC", () => {
    const { users } = paginateMembers(baseMembers, {
      minSendRate: 0,
      sortField: "MONTHS_IN",
      sortOrder: "ASC",
      limit: 50,
    });
    expect(users.map((u) => u.userId)).toEqual(["d", "c", "b", "a"]);
  });

  it("ties break deterministically on userId (stable cursor)", () => {
    const tied = [
      member({ userId: "zzz", userSendRate: 0.5 }),
      member({ userId: "aaa", userSendRate: 0.5 }),
      member({ userId: "mmm", userSendRate: 0.5 }),
    ];
    const { users } = paginateMembers(tied, {
      minSendRate: 0,
      sortField: "SEND_RATE",
      sortOrder: "DESC",
      limit: 50,
    });
    // Same send-rate → fallback to userId ASC.
    expect(users.map((u) => u.userId)).toEqual(["aaa", "mmm", "zzz"]);
  });

  it("clamps limit to MAX_LIMIT upper bound and 1 lower bound", () => {
    const page = paginateMembers(baseMembers, {
      minSendRate: 0,
      sortField: "SEND_RATE",
      sortOrder: "DESC",
      limit: 100000,
    });
    expect(page.users.length).toBe(4); // all rows fit
    expect(page.hasNextPage).toBe(false);
  });

  it("respects the raised MAX_LIMIT (1000) so client-side aggregations can pull a full page", () => {
    // Pin the cap to its post-issue-#1 value so a future
    // "tighten the limit" change has to update this test
    // alongside the schema description on
    // SysAdminCommunityDetailInput.limit, which advertises
    // "default 50, max 1000" to clients computing all-member
    // aggregates (e.g. recipient-to-sender conversion rate).
    expect(MAX_LIMIT).toBe(1000);

    // Build 1500 members so the cap actually bites — at 1500
    // > 1000, requesting limit=2000 returns 1000 and signals
    // hasNextPage. Without the raised cap this would have
    // returned 200 and pretended there were no further pages
    // when only 200 of 1500 had been emitted, which the issue
    // discussion flagged as the L2 blocker.
    const many: SysAdminMemberStatsRow[] = Array.from({ length: 1500 }, (_, i) =>
      member({ userId: `u${String(i).padStart(4, "0")}` }),
    );
    const page = paginateMembers(many, {
      minSendRate: 0,
      sortField: "SEND_RATE",
      sortOrder: "DESC",
      limit: 2000,
    });
    expect(page.users.length).toBe(MAX_LIMIT);
    expect(page.hasNextPage).toBe(true);
    expect(page.nextOffset).not.toBeNull();
  });
});
