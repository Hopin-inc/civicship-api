import "reflect-metadata";
import NftTokenConverter from "@/application/domain/account/nft-token/data/converter";
import { GqlSortDirection } from "@/types/graphql";

describe("NftTokenConverter.filter", () => {
  const converter = new NftTokenConverter();

  it("returns empty where when input is undefined", () => {
    expect(converter.filter(undefined)).toEqual({});
  });

  it("returns empty where when input has no meaningful fields", () => {
    expect(converter.filter({})).toEqual({});
  });

  it("filters by address array", () => {
    const where = converter.filter({ address: ["addr1", "addr2"] });
    expect(where).toEqual({ AND: [{ address: { in: ["addr1", "addr2"] } }] });
  });

  it("filters by type array", () => {
    const where = converter.filter({ type: ["ERC-721"] });
    expect(where).toEqual({ AND: [{ type: { in: ["ERC-721"] } }] });
  });

  it("filters by communityId (direct column match)", () => {
    const where = converter.filter({ communityId: "community-1" });
    expect(where).toEqual({ AND: [{ communityId: "community-1" }] });
  });

  it("ignores empty string communityId (truthy check)", () => {
    // 空文字列は設定ミスの可能性が高いので条件に含めない（他のフィルタと同様の挙動）
    expect(converter.filter({ communityId: "" })).toEqual({});
  });

  it("ignores undefined communityId", () => {
    // GraphQL input 型上は undefined のみ許容されるが、ランタイムの防御として
    // truthy チェックで null も安全に弾く。
    expect(converter.filter({ communityId: undefined })).toEqual({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(converter.filter({ communityId: null as any })).toEqual({});
  });

  it("combines multiple top-level filters with AND", () => {
    const where = converter.filter({
      communityId: "community-1",
      type: ["ERC-721"],
    });
    expect(where).toEqual({
      AND: [{ type: { in: ["ERC-721"] } }, { communityId: "community-1" }],
    });
  });

  it("applies and[] by flattening into AND conditions", () => {
    const where = converter.filter({
      communityId: "community-1",
      and: [{ type: ["ERC-721"] }, { address: ["addr1"] }],
    });
    expect(where.AND).toEqual([
      { communityId: "community-1" },
      { AND: [{ type: { in: ["ERC-721"] } }] },
      { AND: [{ address: { in: ["addr1"] } }] },
    ]);
  });

  it("applies or[] correctly", () => {
    const where = converter.filter({
      or: [{ communityId: "c1" }, { communityId: "c2" }],
    });
    expect(where.OR).toEqual([{ AND: [{ communityId: "c1" }] }, { AND: [{ communityId: "c2" }] }]);
  });

  it("applies not correctly", () => {
    const where = converter.filter({
      not: { communityId: "c1" },
    });
    expect(where.NOT).toEqual({ AND: [{ communityId: "c1" }] });
  });
});

describe("NftTokenConverter.sort", () => {
  const converter = new NftTokenConverter();

  it("returns default sort when input is undefined", () => {
    expect(converter.sort(undefined)).toEqual([{ createdAt: "desc" }, { id: "asc" }]);
  });

  it("sorts by createdAt asc", () => {
    expect(converter.sort({ createdAt: GqlSortDirection.Asc })).toEqual([
      { createdAt: "asc" },
      { id: "asc" },
    ]);
  });

  it("combines multiple sort fields in declared order + id asc tiebreaker", () => {
    const result = converter.sort({
      name: GqlSortDirection.Asc,
      address: GqlSortDirection.Desc,
    });
    expect(result).toEqual([{ name: "asc" }, { address: "desc" }, { id: "asc" }]);
  });
});
