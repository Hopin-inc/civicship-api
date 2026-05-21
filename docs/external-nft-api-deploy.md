# NFT 連携 API — マージ/デプロイ手順 (PR #923)

外部業者向け NFT 連携 REST API (`feat(nft): 外部業者向け NFT 連携 REST API`) を
`develop` にマージ・デプロイする際の運用手順。**この PR 固有の release runbook**
であり、業者向け仕様書 (`docs/external-nft-api.md`) とは別物。

## なぜ手順が必要か

この PR は API 契約 (既存 `POST /api/nft-wallets` のリクエスト/レスポンス) を
変えないが、**新カラム/新テーブルに依存する新コードを含む**。デプロイ順序を
誤ると、migration 適用前に新コードが本番に出て、既存業者の `POST /api/nft-wallets`
が一時的に 500 になる。

### 順序を誤ると壊れる理由

- 内部 API デプロイ (`deploy-to-cloud-run-*`) は migration を適用する
  (`apply-migrations: true`)
- 外部 API デプロイ (`deploy-external-api-*`) は migration を適用しない
  (`apply-migrations: false`、内部側で適用済み前提)
- 両者は `develop` への push で **同時発火・並列・順序保証なし**
- 外部 API デプロイの方が速い (migration ステップが無い) ため、migration 適用前に
  外部 API の新コードが live になりうる
- 新コードの `apiKeyAuthMiddleware` は `ApiKey.vendor` 列を、wallet 登録は
  `NftWallet.chain` 列を参照する。列が無い DB に当たると Prisma がエラー →
  `POST /api/nft-wallets` が認証段階で 500

→ **マージ前に migration を先行適用しておけば、この窓は塞げる**
(3 本とも additive なので、稼働中の旧コードは余分な列を無視するだけで無害)。

## 対象 migration (3 本・すべて additive)

| migration | 内容 |
| --- | --- |
| `20260506235551_add_nft_vendor_and_issued_by_vendor` | `NftVendor` enum、`ApiKey.vendor`、`NftToken.issuedByVendor` |
| `20260507010249_add_nft_chain` | `NftChain` enum、`NftWallet.chain`、`NftToken.chain` + 既存行 backfill |
| `20260521020646_add_vendor_user_link` | `VendorUserLink` テーブル |

破壊的 DDL (DROP / RENAME / 既存列の NOT NULL 化 / 型変更) は無し。

## デプロイ手順

### 1. マージ前: migration を対象 DB に先行適用

dev / prd それぞれの DB に対して、PR をマージする**前**に migration を適用する。

```bash
# dev
pnpm db:deploy   # (.env.dev を読む形で。実際の運用コマンドは DB_MIGRATION.md 参照)

# prd も同様に、prd DB に対して適用
```

additive なので、適用後も稼働中の旧コードは影響を受けない (旧 Prisma client は
新列を SELECT しない)。

### 2. INTERNAL wallet の `chain` を環境別に backfill

`20260507010249_add_nft_chain` は EXTERNAL wallet の `chain` のみ自動 backfill
する。INTERNAL (NMKR / Cardano) wallet は env 依存のため手動:

```sql
-- dev DB
UPDATE t_nft_wallets SET chain = 'CARDANO_PREPROD' WHERE type = 'INTERNAL' AND chain IS NULL;

-- prd DB
UPDATE t_nft_wallets SET chain = 'CARDANO_MAINNET' WHERE type = 'INTERNAL' AND chain IS NULL;
```

### 3. PR をマージ

migration 適用済みの DB に対して新コードが出るので、外部 API デプロイが
内部 API デプロイに先行しても 500 にならない。

### 4. デプロイ後: 業者用 API キーに `vendor` を設定

`PUT /api/nft-tokens/...` 等の vendor 認可エンドポイントは、API キーに `vendor`
が設定されていないと 403。業者用キーに値を入れる:

```sql
UPDATE m_api_keys SET vendor = 'BORDERLESS' WHERE id = '<borderless 用キーの id>';
UPDATE m_api_keys SET vendor = 'KIBOTCHA'   WHERE id = '<kibotcha 用キーの id>';
```

既存の `POST /api/nft-wallets` は `vendor` 未設定でも動くので、ここは
token/instance 連携を始めるタイミングまでに実施すれば良い。

### 5. 動作確認

- 既存 `POST /api/nft-wallets` が従来どおり 200 を返す (回帰)
- `vendor` 設定済みキーで `PUT /api/nft-tokens/:address` が 200
- `vendor` 未設定キーで `PUT /api/nft-tokens/:address` が 403

## ロールバック時の注意

- 新コードを旧コードに戻すだけなら安全 (旧コードは新列・新テーブルを参照しない)
- migration は additive なので **DB を巻き戻す必要は無い**。新列・新テーブルは
  残しておいて問題ない

## フォローアップ (この PR スコープ外)

- **base image bump**: `.trivyignore` に時限追加した `CVE-2026-33845` /
  `CVE-2026-42010` (libgnutls30) の恒久対応。`node:20-slim` を `deb12u7` 入りの
  digest に bump し、`.trivyignore` の 2 エントリを削除する。`expires: 2026-06-04`
- **デプロイ順序の恒久対応**: 外部 API デプロイを内部 API デプロイ (migration
  適用) の後に待たせる仕組み (`workflow_run` 連鎖等) を別途検討。これが入れば
  手順 1 の「事前適用」は不要になる
- **HIGH CVE (advisory 24 件)**: `@opentelemetry/*` / `cross-spawn` / `glob` /
  `minimatch` / `picomatch` / `tar` などの依存更新 (Dependabot 範囲)
