import SysAdminConverter from "@/application/domain/sysadmin/data/converter";
import { encodeMemberListCursor } from "@/application/domain/sysadmin/presenter";

describe("MemberList cursor encoding", () => {
  it("round-trips offsets across the converter ↔ presenter pair", () => {
    for (const offset of [0, 1, 50, 1000, 9999]) {
      expect(SysAdminConverter.parseMemberListCursor(encodeMemberListCursor(offset))).toBe(
        offset,
      );
    }
  });

  it("collapses null / undefined / empty cursor to offset 0", () => {
    // Caller may pass an absent cursor when starting from the first
    // page; the converter must accept all three.
    expect(SysAdminConverter.parseMemberListCursor(null)).toBe(0);
    expect(SysAdminConverter.parseMemberListCursor(undefined)).toBe(0);
    expect(SysAdminConverter.parseMemberListCursor("")).toBe(0);
  });

  it("falls back to 0 on garbage rather than throwing", () => {
    // Tampered / truncated cursors should restart pagination instead
    // of bubbling a parse error to the client.
    expect(SysAdminConverter.parseMemberListCursor("not-base64!!!")).toBe(0);
    expect(SysAdminConverter.parseMemberListCursor("LWZvbw==")).toBe(0); // base64("-foo") → NaN
    expect(SysAdminConverter.parseMemberListCursor("LTU=")).toBe(0); // base64("-5") → negative rejected
  });
});
