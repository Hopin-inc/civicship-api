/**
 * `PointVerifyClient` — local Cardano-anchor lookup for `/point/verify`.
 *
 * 旧 IDENTUS 連携時代は `IDENTUS_API_URL/point/verify` への HTTP call で
 * Merkle root 検証を行っていたが、内製化 epic (`epic/replace-identsu`)
 * 以降は Transaction の Merkle root が `t_transaction_anchors` に持たれ
 * Cardano metadata 1985 に直接 anchor されているため、外部呼び出し無しで
 * DB lookup だけで verify 状態を返せる。
 *
 * 設計参照 (`docs/report/did-vc-internalization.md`):
 *   §1.3 成功基準 #1 — 「`/point/verify` が外部 HTTP 呼び出しゼロで
 *     ローカル DB 参照のみで応答」
 *   §4.1 `TransactionAnchor` schema
 *   §6.2 GIN index 戦略 (`leaf_ids && $1::text[]`)
 *   §0-5 spike PR #1091 — GIN index 採用で 17-27× 高速化を実測
 *
 * Class 名は legacy 互換 (DI token / 呼出側を温存) のため `PointVerifyClient`
 * のまま。将来の cleanup PR でリネーム想定。
 */

import { injectable } from "tsyringe";
import { AnchorStatus, type ChainNetwork } from "@prisma/client";

import { prismaClient } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";

export interface VerifyRequest {
  txIds: string[];
}

export interface VerifyResponse {
  txId: string;
  status: "verified" | "not_verified" | "pending" | "error";
  transactionHash: string;
  rootHash: string;
  label: string | number;
}

/**
 * `t_transaction_anchors` 行のうち本 client が必要とする列だけを raw 取得。
 * `Prisma.transactionAnchorFindMany` ではなく `$queryRaw` を使うのは GIN index
 * `@@index([leafIds], type: Gin)` を `leaf_ids && $1::text[]` で確実に引かせ
 * るため (Prisma の `hasSome` operator は型変換に走りがちで planner が GIN
 * を選ばないことがある、§6.2 / PR #1091 参照)。
 */
interface AnchorRow {
  id: string;
  leaf_ids: string[];
  root_hash: string;
  chain_tx_hash: string | null;
  metadata_label: number;
  status: AnchorStatus;
  network: ChainNetwork;
}

function mapAnchorStatus(status: AnchorStatus): VerifyResponse["status"] {
  switch (status) {
    case AnchorStatus.CONFIRMED:
      return "verified";
    case AnchorStatus.SUBMITTED:
      return "pending";
    case AnchorStatus.PENDING:
      return "pending";
    case AnchorStatus.FAILED:
      return "error";
    default:
      return "error";
  }
}

@injectable()
export class PointVerifyClient {
  /**
   * 与えられた `Transaction.id` の集合に対し、各 id がどの
   * `TransactionAnchor` に含まれているかを 1 クエリで lookup し、
   * verify 状態 / Cardano tx hash / Merkle root / metadata label を返す。
   *
   * 入力件数は呼び元 (`TransactionVerificationUseCase`) で 100 件に
   * cap 済。本実装でも追加の安全策として `Array.from(new Set(...))` で
   * dedupe する。anchor に含まれない txId は `status="not_verified"`
   * で `transactionHash` / `rootHash` を空文字、`label` を 1985 (CIP-10
   * civicship label) で返す。
   */
  async verifyTransactions(txIds: string[]): Promise<VerifyResponse[]> {
    if (txIds.length === 0) return [];

    const dedupedIds = Array.from(new Set(txIds));

    // GIN index を効かせる overlap 検索。Prisma `$queryRaw` の tagged
    // template は parameter 化されるので injection safe。
    const anchors = await prismaClient.$queryRaw<AnchorRow[]>`
      SELECT id, leaf_ids, root_hash, chain_tx_hash, metadata_label, status, network
      FROM t_transaction_anchors
      WHERE leaf_ids && ${dedupedIds}::text[]
    `;

    // txId → 最良 anchor のマップ。同 txId が複数 anchor に乗ることは
    // 設計上発生しない (`TransactionAnchor.leafIds` は履歴の正本) が、
    // 異常データに備えて `CONFIRMED > SUBMITTED > PENDING > FAILED` の
    // 優先度で最良の状態を採用する。
    const anchorByTxId = new Map<string, AnchorRow>();
    const priority: Record<AnchorStatus, number> = {
      [AnchorStatus.CONFIRMED]: 3,
      [AnchorStatus.SUBMITTED]: 2,
      [AnchorStatus.PENDING]: 1,
      [AnchorStatus.FAILED]: 0,
    };
    for (const a of anchors) {
      for (const leaf of a.leaf_ids) {
        if (!dedupedIds.includes(leaf)) continue;
        const current = anchorByTxId.get(leaf);
        if (!current || priority[a.status] > priority[current.status]) {
          anchorByTxId.set(leaf, a);
        }
      }
    }

    logger.debug("[PointVerifyClient] local lookup", {
      input: txIds.length,
      deduped: dedupedIds.length,
      anchors_hit: anchors.length,
      matched_tx_ids: anchorByTxId.size,
    });

    // 入力順を保ったまま結果配列を組み立てる (呼出側が input-output の
    // index 一致を期待しうるため)。
    return txIds.map((txId) => {
      const anchor = anchorByTxId.get(txId);
      if (!anchor) {
        return {
          txId,
          status: "not_verified" as const,
          transactionHash: "",
          rootHash: "",
          label: 1985,
        };
      }
      return {
        txId,
        status: mapAnchorStatus(anchor.status),
        transactionHash: anchor.chain_tx_hash ?? "",
        rootHash: anchor.root_hash,
        label: anchor.metadata_label,
      };
    });
  }
}
