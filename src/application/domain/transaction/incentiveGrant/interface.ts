import { IContext } from "@/types/server";
import {
  GrantSignupBonusResult,
  PrismaTransactionDetail,
} from "@/application/domain/transaction/data/type";
import { PrismaIncentiveGrantDetail } from "@/application/domain/transaction/incentiveGrant/data/type";
import { IncentiveGrantFailureCode } from "@prisma/client";
import { GqlSignupBonusFilterInput, GqlSignupBonusSortInput } from "@/types/graphql";

/**
 * 特典付与（IncentiveGrant）に関するドメインロジックを定義するインターフェース
 */
export interface IIncentiveGrantService {
  /**
   * 【推奨】サインアップボーナス付与の全工程をベストエフォートで実行する。
   * IdentityUseCase からの唯一のエントリポイント。
   * 設定確認、ウォレット検証、二重付与防止、残高不足の記録をすべて内包する。
   */
  grantSignupBonusIfEnabledBestEffort(
    ctx: IContext,
    userId: string,
    communityId: string,
  ): Promise<void>;

  /**
   * 特典付与のコアロジック。
   * 冪等性を担保しながら、トランザクション分離レベルを考慮してポイントを付与する。
   */
  grantSignupBonus(
    ctx: IContext,
    args: {
      userId: string;
      communityId: string;
      fromWalletId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<GrantSignupBonusResult>;

  /**
   * 失敗した特典付与を再試行する。
   * 状態を PENDING に戻してから実行し、UI向けの結果を返す。
   */
  retrySignupBonus(
    ctx: IContext,
    args: {
      grantId: string;
      fromWalletId: string;
      toWalletId: string;
      bonusPoint: number;
      message?: string;
    },
  ): Promise<{
    success: boolean;
    transaction?: PrismaTransactionDetail;
    error?: string;
  }>;

  /**
   * 特定のコミュニティの特典付与履歴を取得する（管理画面用）。
   */
  getSignupBonuses(
    ctx: IContext,
    communityId: string,
    filter?: GqlSignupBonusFilterInput | null,
    sort?: GqlSignupBonusSortInput | null,
  ): Promise<PrismaIncentiveGrantDetail[]>;

  /**
   * 実行を伴わずに「失敗レコード」のみを作成する。
   * バリデーション層で事前にエラーを検知した場合に使用。
   */
  createFailedSignupBonusGrant(
    ctx: IContext,
    args: {
      userId: string;
      communityId: string;
      failureCode: IncentiveGrantFailureCode;
      lastError: string;
    },
  ): Promise<void>;
}
