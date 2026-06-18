/**
 * GdprDeletionService scaffold の interface 互換性検証。
 *
 * 本テストは Phase 4+ 実装まで「not implemented を投げる」ことを保証し、
 * 誤って空実装が production に混入しないことを確認する。
 *
 * 設計参照: docs/report/did-vc-internalization.md §9.7
 */

import "reflect-metadata";
import { container } from "tsyringe";
import { GdprDeletionService } from "@/application/domain/gdpr/service";
import type { IContext } from "@/types/server";

describe("GdprDeletionService (§9.7 scaffold)", () => {
  beforeEach(() => {
    container.reset();
    container.register("GdprDeletionService", { useClass: GdprDeletionService });
  });

  it("deleteUserData throws 'not implemented' until Phase 4+ implementation lands", async () => {
    const service = container.resolve(GdprDeletionService);
    const ctx = {} as IContext;

    await expect(service.deleteUserData(ctx, "user_dummy")).rejects.toThrow(
      /not implemented — §9.7 Phase 4\+ task/,
    );
  });

  it("deleteUserData accepts optional reason parameter (interface contract)", async () => {
    const service = container.resolve(GdprDeletionService);
    const ctx = {} as IContext;

    // reason を渡しても interface 上は受け付けることを確認 (throw は Phase 4+ で実装)
    await expect(
      service.deleteUserData(ctx, "user_dummy", { reason: "gdpr_art17" }),
    ).rejects.toThrow(/not implemented/);
  });
});
