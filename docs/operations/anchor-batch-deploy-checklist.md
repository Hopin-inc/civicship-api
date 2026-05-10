# Anchor Batch Deploy Checklist

`POST /admin/anchor-batch/run` を Cloud Scheduler から週次起動する運用に
入れる前に確認するチェックリスト。

設計参照:

- `docs/report/did-vc-internalization.md` §5.1.6 (label 1985 metadata)
- `docs/report/did-vc-internalization.md` §5.1.7 (Merkle 構築)
- `docs/report/did-vc-internalization.md` §5.2.3 (anchor ドメイン)
- `docs/report/did-vc-internalization.md` §5.3.1 (週次バッチ + idempotency)

## 1. Cloud Run timeout (Blocker)

### 必須要件: `request timeout >= 600s`

`AnchorBatchService.runWeeklyBatch` は **同一リクエスト内で** 以下を直列に実行する:

1. PENDING anchor の取得 + CAS claim (DB)
2. Merkle root 計算 + AuxiliaryData 構築
3. Blockfrost への UTXO / protocol params / 最新 slot 取得
4. Cardano tx の build + 署名
5. Blockfrost への submit
6. **`awaitConfirmation` (default 5 分待機)**

このため Cloud Run の default `request timeout = 300s` のままだと、
ブロック確定を待っている最中に外側でタイムアウトが発生し、
`markFailed` まで到達できないリスクがある。

#### Cloud Run 設定

| 環境       | request timeout | 根拠                                        |
| ---------- | --------------- | ------------------------------------------- |
| local      | 任意            | テスト時は短縮可                            |
| staging    | 600s 以上       | `awaitConfirmation` default + tx build 余裕 |
| production | 600s 以上       | 同上。場合により 900s 推奨                  |

#### `gcloud` 例

```bash
gcloud run services update civicship-api \
  --region=asia-northeast1 \
  --timeout=600s
```

### `CARDANO_AWAIT_CONFIRM_TIMEOUT_MS` env による override

`awaitConfirmation` の待機時間は `CARDANO_AWAIT_CONFIRM_TIMEOUT_MS` で
ms 単位に override できる（unset または不正値の場合は default 300_000ms）。

| 環境       | 推奨値      | 想定                                                  |
| ---------- | ----------- | ----------------------------------------------------- |
| staging    | `60000`     | 1 分。preprod は確定が早いので短く保つ                |
| production | `240000`    | 4 分。確定遅延の余裕を持たせつつ Cloud Run 内に収める |
| local test | `5000` 未満 | Cloud Run に乗せない単体テスト時のみ                  |

**制約**: `Cloud Run timeout > CARDANO_AWAIT_CONFIRM_TIMEOUT_MS + 60s` の
余裕を必ず持たせる（tx build/submit + DB write の上限を 60s と見積もる）。

> **Phase 1.5 / Phase 2 TODO**: `runWeeklyBatch` を 2 段階
> `submitBatch` (submit まで → SUBMITTED 永続化で即 return) と
> `confirmBatch` (Cloud Tasks 等で別呼び出し、`awaitConfirmation` のみ)
> に分離する。これにより 1 リクエスト辺りの timeout 制約を緩和できる。

## 2. Cloud Scheduler

### 必須 env

| Key                                | 用途                                                          |
| ---------------------------------- | ------------------------------------------------------------- |
| `CLOUD_SCHEDULER_TOKEN`            | Scheduler → API 認証用の固定 header 値（Secret Manager 配信） |
| `CARDANO_PLATFORM_ADDRESS`         | issuer enterprise address (bech32)                            |
| `CARDANO_PLATFORM_PRIVATE_KEY_HEX` | 32-byte ed25519 seed の hex (raw)。Phase 1 暫定               |
| `CARDANO_NETWORK`                  | `preprod` または `mainnet`                                    |
| `CARDANO_AWAIT_CONFIRM_TIMEOUT_MS` | (任意) override                                               |

### Scheduler ジョブ設定

- **頻度**: 週 1 回（例: `0 3 * * MON` / Asia/Tokyo）
- **HTTP method**: `POST`
- **URL**: `https://<cloud-run-url>/admin/anchor-batch/run`
- **Body**: `{}` または `{"weeklyKey": "2026-W19"}`（省略時はサーバ側で計算）
- **Headers**: `Content-Type: application/json` / `X-CloudScheduler-Token: <secret>`
- **Retry config**:
  - `retryCount`: 3
  - `minBackoffDuration`: 60s
  - `maxBackoffDuration`: 600s
  - `maxDoublings`: 3
- **Attempt deadline**: Cloud Run timeout と一致させる（例: 600s）

> **重要**: idempotency は server 側で `getBatchTerminalStatus` により
> 担保しているため、Scheduler の retry が同 weeklyKey を再投入しても
> 二重 submit にはならない（`§5.3.1`）。ただし `awaitConfirmation` の
> 途中で Cloud Run timeout に当たって 503 が返った場合は次の retry が
> `claimPendingAnchors` で 0 件 claim → PENDING で early return する
> ため、人手で `markFailed` するか別 batchId に逃がす運用が必要。

## 3. 監視・アラート（最低限）

| メトリクス                                       | 閾値                 | アクション                                   |
| ------------------------------------------------ | -------------------- | -------------------------------------------- |
| Cloud Run 5xx (anchor-batch endpoint)            | >= 1 / week          | on-call → 手動トリガで再実行                 |
| Cloud Scheduler job failure                      | >= 1 retry exhausted | on-call → ログ確認 → manual `runBatch`       |
| `[AnchorBatchService] batch failed` log 出現     | >= 1 / week          | failure reason 確認 → 必要に応じて DB 修復   |
| `markFailed` で記録された TransactionAnchor 件数 | > 0                  | 当該 weeklyKey の anchor を別 batch で再処理 |

## 4. Phase 2 で見直す項目

- §G overlap multi-key 仕様（key rotation 中の重複 batch）
- KMS 経由署名（`KmsSigner.signEd25519` → vkey witness 手動 attach）
- `documentCbor` の chain inclusion（現状は metadata の `h` で改ざん検知）
- `runBatch` を fire-and-forget に分離（submit / confirm 2 endpoint）
