# Blockfrost API Key Rotation Runbook

civicship-api が Cardano preprod / mainnet への接続に使う **Blockfrost
project_id** を rotation する手順書。設計書
(`docs/report/did-vc-internalization.md`) §5.1.5 / §10.2 / §10.6 を運用化した
もの。

> **Shell 前提**: 本手順内の `bash` / `zsh` 構文 (`$(date -u ...)` 等) は
> Linux / macOS のシェル前提。Windows から実行する場合は WSL2 / Git Bash
> 経由か、`Get-Date -UFormat "%Y%m%dT%H%M%SZ"` 等の PowerShell 等価コマンド
> に読み替え。手動で `YYYYMMDDTHHMMSSZ` 形式の ISO8601 文字列を生成する
> でも可。

## 1. 概要

### 1.1 何をする手順か

Blockfrost dashboard で発行した `project_id` を新 version に切り替え、
Secret Manager → Cloud Run Service / Cloud Run Job の env に再配線する一連
の操作。

### 1.2 影響範囲

| コンポーネント | 影響 |
|---|---|
| 週次 `AnchorBatchService.runWeeklyBatch` (`kyoso-dev-civicship-batch`) | 起動時に `BLOCKFROST_PROJECT_ID` を pick up → 新キーで Cardano に submit |
| `/point/verify`（内製化済、Blockfrost を直接叩かない） | 影響なし |
| `cardano-canary.yml` workflow | `gh dev environment` の `BLOCKFROST_PROJECT_ID` を参照、CI secret 経由でローテ |
| 既存 anchor の検証 (`verify-from-chain.ts`) | tx_hash は変わらない、新キー越しでも同じ tx を fetch 可 |
| ローカル `.env.dev` で実行する scripts | rotation 後の値を `dotenvx set` で同期する |

> **重要 invariant**: Blockfrost project_id は **読み取り権限のみ持つ API
> アクセスキー** であり、Cardano wallet 鍵とは無関係。漏洩しても submit さ
> れる tx の整合性には影響しない。ただし rate limit や課金が悪意ある利用に
> 流用されうるため、漏洩時は即時 disable する。

### 1.3 想定 trigger

| trigger | 頻度 | 緊急度 |
|---|---|---|
| 年次定期 rotation | 1 回 / 年 | 低 |
| API key 漏洩疑い | ad hoc | 高 — §5 |
| Blockfrost プラン変更 (free → paid 等) | ad hoc | 低 |
| network 切替 (`preprod` ↔ `mainnet`) | mainnet 移行 1 回限り | 中 |

---

## 2. 前提

### 2.1 権限

| 必要権限 | 付与対象 |
|---|---|
| Blockfrost dashboard へのアクセス | 実施者（既存プロジェクトを管理する account） |
| Secret Manager 新 version 追加 (`roles/secretmanager.admin` 相当) | 実施者 |
| Cloud Run Service / Job の env 更新 (`roles/run.developer`) | 実施者 |
| GH environment secret 編集 (本リポジトリの admin) | 実施者 |

### 2.2 環境前提

- Secret Manager に `BLOCKFROST_PROJECT_ID` secret が既に存在。Cloud Run
  Service / Job が `--update-secrets=BLOCKFROST_PROJECT_ID=BLOCKFROST_PROJECT_ID:latest`
  形式で参照していること。
- GH environments (`dev` / `co-creation-dao-prod`) に同名 secret あり。
  canary workflow から参照される。
- network 切替を伴わない場合は、新キーの prefix が旧キーと一致すること
  （`preprod` → `preprod`、`mainnet` → `mainnet`）。
  `BlockfrostClient.assertProjectIdMatchesNetwork` で起動時に拒否される
  ため、prefix mismatch は即発火する。

### 2.3 通知

実施前に on-call channel へ rotation 予定共有。新キー反映までの間 (cron で
~1h、即時反映を選ぶなら ~1 分) は anchor batch が古いキーで動く可能性が
あるため、anchor batch を rotation 直前に走らせない。

---

## 3. 手順 (step-by-step)

### Step 1: Blockfrost dashboard で新 project_id を発行

1. https://blockfrost.io/dashboard にアクセス
2. 対象 project (preprod or mainnet) を選択
3. "Add new API key" → 旧キーと同じ network が指定されていることを確認
4. 発行された project_id (`preprod...` or `mainnet...` で始まる) をコピー

> **warning**: 発行された key はこの画面でしか表示されない。Secret
> Manager に投入後、ブラウザの履歴 / クリップボードを必ずクリア。

### Step 2: GCP Secret Manager に新 version を追加

```bash
echo -n "<新 project_id>" | gcloud secrets versions add \
  BLOCKFROST_PROJECT_ID \
  --data-file=- \
  --project=<gcp-project-id>
```

`gcloud secrets versions list BLOCKFROST_PROJECT_ID --project=<gcp-project-id>`
で **新 version が `enabled` 状態** になっていることを確認。

### Step 3: Cloud Run Service / Job に反映

Cloud Run の secret 参照が `BLOCKFROST_PROJECT_ID:latest` であれば、新
revision を起動するだけで自動で `latest` を pick up する。即時反映が
必要 (or revision 起動を強制したい) な場合:

```bash
# Service
gcloud run services update kyoso-dev-civicship-api \
  --region=us-central1 --project=<gcp-project-id> \
  --update-labels=blockfrost-rotated-at=$(date -u +%Y%m%dT%H%M%SZ)

# Job
gcloud run jobs update kyoso-dev-civicship-batch \
  --region=us-central1 --project=<gcp-project-id> \
  --update-labels=blockfrost-rotated-at=$(date -u +%Y%m%dT%H%M%SZ)
```

ラベル更新で no-op revision を発行し、再起動時に env を再取得させる。

### Step 4: GitHub environment secret を同期

`cardano-canary.yml` workflow は **GH dev environment の `BLOCKFROST_PROJECT_ID`** を参照する。Secret Manager と GH environment は別系統なので、Secret Manager の更新だけでは CI canary は古いキーのまま。

1. https://github.com/Hopin-inc/civicship-api/settings/environments
2. 対象 environment (`dev` / `co-creation-dao-prod`) を開く
3. `BLOCKFROST_PROJECT_ID` secret を **Update value** → 新 project_id を貼る
4. （任意）他に `BLOCKFROST_*` 系の secret が増えた場合は同様に同期

### Step 5: ローカル `.env.dev` を更新（PoC スクリプト用）

```bash
pnpm exec dotenvx set BLOCKFROST_PROJECT_ID <新 project_id> -f .env.dev
```

`scripts/preprod-e2e-submit.ts` / `scripts/cardano-canary.ts` /
`scripts/backfill-*.ts` 等で参照される。

### Step 6: 動作確認

#### 6.1 canary で health check
```bash
gh workflow run cardano-canary.yml --ref develop --repo Hopin-inc/civicship-api
# 完走後
gh run list --workflow=cardano-canary.yml --repo Hopin-inc/civicship-api --limit 1
```

`All canary checks passed.` が出れば OK。ローカルで叩く場合:
```bash
pnpm exec dotenvx run -f .env.dev -- pnpm exec tsx scripts/cardano-canary.ts
```

#### 6.2 anchor batch を強制 trigger
```bash
gcloud scheduler jobs run kyoso-dev-civicship-batch-scheduler-sync-did-vc \
  --location=us-central1 --project=<gcp-project-id>
# 完走後
gcloud run jobs executions list --job=kyoso-dev-civicship-batch \
  --region=us-central1 --project=<gcp-project-id> --limit=3
```

最新 execution が `Succeeded` であれば OK。

#### 6.3 ログで新 project_id が使われていること
直接的なキー値はログには出ないが、`[BlockfrostClient]` のリトライ / エラーが
0 件 であれば反映成功とみなす。

### Step 7: 旧 project_id を disable

新キーで動作確認が取れたら、**24h 経過後** に旧 project_id を Blockfrost
dashboard で disable / 削除:

1. https://blockfrost.io/dashboard
2. 旧 project_id の行 → "Disable" or "Delete"

> 24h 待つ理由: Cloud Run revision の rollback 余地を残すため。新キーで
> 起動失敗が起きた場合、`gcloud run services update-traffic` で revision を
> 戻すと、旧 revision は旧キーを参照する。

### Step 8: 監査ログと記録

- Secret Manager の `BLOCKFROST_PROJECT_ID` 履歴で新 version 作成 + 旧
  version disable のタイムスタンプ確認:
  ```bash
  gcloud secrets versions list BLOCKFROST_PROJECT_ID --project=<gcp-project-id>
  ```
- 実施記録を Notion runbook log に記載 (時刻 / 実施者 / 旧 project_id の
  先頭 prefix のみ / 新 project_id の先頭 prefix のみ / canary 結果 /
  anchor batch 結果)

---

## 4. ロールバック

新キーで anchor batch が submit に失敗するなどの問題が起きた場合:

```bash
# Secret Manager の旧 version を再有効化
gcloud secrets versions enable <旧 version 番号> \
  --secret=BLOCKFROST_PROJECT_ID \
  --project=<gcp-project-id>

# 新 version を disable
gcloud secrets versions disable <新 version 番号> \
  --secret=BLOCKFROST_PROJECT_ID \
  --project=<gcp-project-id>

# Cloud Run を再起動して env 再取得
gcloud run services update kyoso-dev-civicship-api \
  --region=us-central1 --project=<gcp-project-id> \
  --update-labels=blockfrost-rolled-back-at=$(date -u +%Y%m%dT%H%M%SZ)
```

GH environment secret も合わせて旧 project_id に戻す。

---

## 5. 災害復旧 (key 漏洩)

### 5.1 漏洩判定

- Blockfrost dashboard の usage グラフに **想定外の rate 急増**
- 自社 IP 以外からの大量リクエスト跡
- 公開リポジトリへの誤コミット検知 (`git log -p | grep -i blockfrost`)

### 5.2 緊急 rotation (1h 以内)

1. **旧 key を即時 disable** (Blockfrost dashboard で "Disable")
2. §3 Step 1〜6 を圧縮実施 (Secret Manager + Cloud Run + GH environment)
3. **漏洩経路の特定** (audit / commit 履歴 / SA 鍵)
4. **incident report**: 24h 以内に on-call → CTO → 影響範囲開示

> **anchor batch への影響**: 旧キーを disable した瞬間に走っていた batch
> は失敗するが、PENDING anchor は次回 batch で再 submit される
> (`AnchorBatchService.markFailed` が attempt_count を加算)。データ消失なし。

---

## 6. 監査ログとメトリクス

### 6.1 Secret Manager 版

```bash
gcloud secrets versions list BLOCKFROST_PROJECT_ID --project=<gcp-project-id>
```

各 version の `STATE` / `CREATED` を確認。rotation は version の連番で
追跡可能。

### 6.2 Cloud Run revision 履歴

```bash
gcloud run services describe kyoso-dev-civicship-api \
  --region=us-central1 --project=<gcp-project-id> \
  --format="value(spec.template.spec.containers[0].env)"
```

`BLOCKFROST_PROJECT_ID` の `secretKeyRef.key` が `latest` を指していれば
自動更新が効く。

### 6.3 anchor batch エラー率

```bash
gcloud logging read \
  'resource.type="cloud_run_job" AND
   resource.labels.job_name="kyoso-dev-civicship-batch" AND
   severity>=ERROR' \
  --project=<gcp-project-id> --limit=20 --freshness=24h
```

rotation 直後に Blockfrost 関連のエラーが出ていないことを確認。

---

## 7. 関連ドキュメントとリンク

- 設計書 §5.1.5 (`BlockfrostClient`) / §10.2 (Cardano + Blockfrost コスト) /
  §10.6 (運用工数 — 年 1 回 30 分)
- 関連コード:
  - `src/infrastructure/libs/blockfrost/client.ts` — `BlockfrostClient`
  - `src/application/provider.ts` — DI 登録
  - `.github/workflows/cardano-canary.yml` — CI canary
  - `scripts/cardano-canary.ts` — ローカル / CI dry-run

### 7.1 別系統の鍵 runbook (混同しないこと)

- [`docs/runbooks/issuer-did-key-rotation.md`](./issuer-did-key-rotation.md) —
  **Issuer DID 鍵 (Ed25519, KMS 管理)**。VC JWT の署名鍵。Blockfrost API key
  とは無関係。
- [`docs/operations/anchor-batch-deploy-checklist.md`](../operations/anchor-batch-deploy-checklist.md) —
  **Cardano platform wallet 鍵** (`CARDANO_PLATFORM_PRIVATE_KEY_HEX`)。
  tx 署名鍵。これも Blockfrost API key とは別系統。
