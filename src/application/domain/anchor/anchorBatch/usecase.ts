/**
 * AnchorBatchUseCase.
 *
 * 週次バッチの起動エントリ。Cron / 管理 REST endpoint から呼ばれる。
 *
 * 設計参照:
 *   docs/report/did-vc-internalization.md §5.2.3 / §5.3.1
 */

import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import {
  AnchorBatchService,
  computeIsoWeeklyKey,
} from "@/application/domain/anchor/anchorBatch/service";
import AnchorBatchPresenter, {
  AnchorBatchHttpResponse,
} from "@/application/domain/anchor/anchorBatch/presenter";

@injectable()
export default class AnchorBatchUseCase {
  constructor(
    @inject("AnchorBatchService")
    private readonly service: AnchorBatchService,
  ) {}

  /**
   * 週次バッチを実行する。
   *
   * 注: anchor batch は内部 service / repository が `internal()` を使うため
   * `onlyBelongingCommunity` トランザクションは張らない。冪等性は
   * batchId（= weeklyKey）の CAS で担保する（§5.3.1）。
   */
  async runBatch(
    ctx: IContext,
    args: { weeklyKey?: string } = {},
  ): Promise<AnchorBatchHttpResponse> {
    const weeklyKey = args.weeklyKey ?? computeIsoWeeklyKey();
    const result = await this.service.runWeeklyBatch(ctx, { weeklyKey });
    return AnchorBatchPresenter.toHttpResponse(result);
  }
}
