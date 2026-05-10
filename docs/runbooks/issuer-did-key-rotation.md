# Issuer DID Key Rotation Runbook

civicship.app の Issuer DID (`did:web:api.civicship.app`) が VC 署名・DID
Document 配信に用いる **Ed25519 鍵を Cloud KMS で rotation する手順書**。

設計参照（`docs/report/did-vc-internalization.md`）:

- §5.4.3 IssuerDidService
- §G / §9.1.2 Issuer 鍵のローテーション戦略
- §9.1.3 旧鍵で署名された VC を未来永劫検証可能にする戦略
- §16 Phase 2 / 1.5 持ち越し

関連コード: `src/application/domain/credential/issuerDid/service.ts` /
`src/infrastructure/libs/did/issuerDidBuilder.ts`

> **Phase 1.5 時点のスコープ**: 本 runbook は **single-active-key** での
> rotation 手順を確立する。§G overlap window（旧鍵と新鍵を一定期間
> `verificationMethod[]` に並列配信して 24h grace を作る運用）は Phase 2
> 持ち越し（設計 §16）。Phase 1.5 の rotation は **「新鍵 ACTIVE 化と
> 同時に旧鍵を INACTIVE に落とす hard cut-over」** であり、TTL cache の
> 自然失効を待つ間（最大 1h）は古い verifier 視点で旧鍵が見え続ける。

---

## 1. 概要

### 1.1 何をする手順か

civicship.app の **Issuer 用 Ed25519 鍵** を Cloud KMS の新しい
`cryptoKeyVersions/N` に切り替え、`/.well-known/did.json` の
`verificationMethod[]` に反映する一連のオペレーション。各 step は §3 を参照:
(1) KMS で新 key version 生成、(2) 公開鍵を raw 32 byte hex に変換、
(3) `t_issuer_did_keys` に `PENDING` で INSERT、(4) Phase 2 実装後は
overlap window を開く、(5) 新 key を `ACTIVE` 昇格 + 旧 key を `INACTIVE`
降格、(6) `IssuerDidService` の TTL cache を flush、(7) 配信検証。

### 1.2 影響範囲

| コンポーネント | 影響 |
| -------------- | ---- |
| `/.well-known/did.json` の `verificationMethod[]` | 新鍵に切り替わる（cache TTL 1h 経過後） |
| 新規 VC JWT の `header.kid` | 新鍵 fragment（例: `#key-2`）になる |
| 新規 VC JWT の署名 | 新鍵で署名 |
| 既存 VC JWT の検証 | **影響なし**（旧 key version は KMS / DB に残置） |
| StatusList VC JWT の署名 | Issuer 鍵兼用のため、再署名タイミングで新鍵に切り替わる |
| Cardano anchor batch の tx 署名 | **影響なし**（platform wallet 鍵は別系統、§9.1.4） |

> **重要 invariant**: 過去 VC の検証可能性を保つため **旧 key version を
> KMS / DB から削除しない**。設計 §9.1.3 の戦略 (a) — `verificationMethod`
> に旧鍵を永久保持 — を採用しているため、旧 KMS key version は
> `DISABLED` 状態で永久保持し、`DESTROYED` には絶対しない。

### 1.3 想定 trigger

| trigger | 頻度 | 緊急度 |
| ------- | ---- | ------ |
| 年次定期 rotation | 1 回 / 年 | 低 |
| 鍵漏洩 / 紛失検知 | ad hoc | 高 — §5 災害復旧 |
| KMS 鍵リング migration | ad hoc | 中 |

---

## 2. 前提

### 2.1 権限

| 必要権限 | 付与対象 |
| -------- | -------- |
| `roles/cloudkms.admin` または `cloudkms.cryptoKeyVersions.create` | 実施者 |
| `roles/cloudkms.signerVerifier` | civicship-api Cloud Run runtime SA |
| `roles/cloudkms.publicKeyViewer` | 実施者 / runtime SA |
| DB 書き込み権限（`t_issuer_did_keys` への INSERT / UPDATE） | 実施者 |
| `roles/run.developer`（任意、即時反映を急ぐ場合のみ） | 実施者 |

### 2.2 環境前提

- `civicship-issuer` 鍵リング（`global` location）が既に存在していること。
  設計 §9.1.5 / §18 参照。
- staging / mainnet で **同じ鍵リング名** をプロジェクト単位で分離。
- `/.well-known/did.json` のキャッシュ TTL は **1h**
  （`IssuerDidService.PUBLIC_KEY_TTL_MS`）。

### 2.3 検証順序

**必ず staging で先行検証してから mainnet に適用する**。staging で
runbook の各 step を実行し、`/.well-known/did.json` の差分と新鍵での
VC 発行 / 検証フローを通しでテストすること。

### 2.4 通知

実施前に on-call チャネル（Slack `#civicship-ops`）へ rotation 予定を共有。
旧鍵で署名された VC の verifier integration 報告に対し切り分けを早めるため。

---

## 3. 手順 (step-by-step)

### Step 1: 新 key version を Cloud KMS で生成

```bash
gcloud kms keys versions create \
  --keyring=civicship-issuer --location=global \
  --key=did-issuer-key --project=<gcp-project-id>
```

> **location 注**: 設計 §9.1.5 では Issuer 鍵は `global` location 推奨。
> 既存リング名 / location は GCP コンソールで事前に確認する。

実行後、出力される **新 keyResourceName** をメモする
（`projects/<id>/locations/global/keyRings/civicship-issuer/cryptoKeys/did-issuer-key/cryptoKeyVersions/N`）。

### Step 2: 公開鍵を取得して Ed25519 raw 32 byte hex に変換

```bash
gcloud kms keys versions get-public-key N \
  --keyring=civicship-issuer --location=global \
  --key=did-issuer-key --project=<gcp-project-id> \
  --output-file=pubkey.pem
```

KMS が返す PEM は **SubjectPublicKeyInfo (SPKI) / RFC 8410** 形式の Ed25519
公開鍵。`IssuerDidBuilder` が要求するのは **raw 32 byte の lowercase hex**
（`issuerDidBuilder.ts` の publicKey 引数仕様）。

変換手順: PEM を base64 デコード → SPKI DER (44 byte) → SPKI ヘッダ（先頭
12 byte = `302a300506032b6570032100`）を剥がす → 残り 32 byte を lowercase
hex に。

```bash
openssl pkey -in pubkey.pem -pubin -outform DER | tail -c 32 | xxd -p -c 64
# → 64 char の lowercase hex
```

> **warning**: 得られた hex が **32 byte = 64 chars** であることを必ず確認。

### Step 3: DB に新 key を `PENDING` 状態で追加

> **schema 注**: 現行 Phase 1 の `IssuerDidKeyRow`
> （`src/application/domain/credential/issuerDid/data/type.ts`）は
> `id` / `kmsKeyResourceName` / `activatedAt` / `deactivatedAt` のみの
> minimal shape である。下記 SQL の `status` / `public_key_ed25519_hex`
> 列は **runbook 上の概念モデル**で、Phase 1.5 schema PR で追加される列を
> 前提に書かれている。schema PR 反映時に列名を実体に合わせて読み替える
> （`PENDING` ⇔ `activated_at IS NULL` 相当）。

```sql
INSERT INTO t_issuer_did_keys (
  kms_key_resource_name,
  public_key_ed25519_hex,
  status,
  activated_at
) VALUES (
  'projects/<gcp-project-id>/locations/global/keyRings/civicship-issuer/cryptoKeys/did-issuer-key/cryptoKeyVersions/N',
  '<32 byte hex>',
  'PENDING',
  NULL
);
```

INSERT 後、その行の `id` (cuid) をメモする。

### Step 4: §G overlap window の開始（**Phase 2 で実装予定**）

> **本 step は Phase 1.5 では実施しない**。設計 §G の 24h overlap window は
> multi-key Document 配信を前提とするが、Phase 1 / 1.5 の
> `IssuerDidService.getActiveIssuerDidDocument()` は `findActiveKey()` 1 回
> 呼出の single-active-key 実装に固定。Phase 2 で `listActiveKeys()` 採用後、
> `verificationMethod[]` に旧鍵 + 新鍵を並列列挙し、`assertionMethod` 先頭を
> 新鍵にして 24h 経過後に旧鍵を INACTIVE に降格する。Phase 1.5 ではこの猶予
> を取らず Step 5 で **hard cut-over** する。

### Step 5: 新 key を `ACTIVE` 化、旧 key を `INACTIVE` 化

両 UPDATE を **同一 transaction** で実行し、ACTIVE が 1 行のみという
invariant を維持する:

```sql
BEGIN;

UPDATE t_issuer_did_keys
SET status = 'ACTIVE',
    activated_at = NOW()
WHERE id = '<new-key-id>'
  AND status = 'PENDING';

UPDATE t_issuer_did_keys
SET status = 'INACTIVE',
    deactivated_at = NOW()
WHERE status = 'ACTIVE'
  AND id != '<new-key-id>';

COMMIT;
```

> **invariant**: `SELECT count(*) FROM t_issuer_did_keys WHERE status = 'ACTIVE'`
> は常に 0 または 1。COMMIT 直前にこのクエリで確認すること。

### Step 6: `IssuerDidService` の TTL cache を反映

`IssuerDidService` は KMS 公開鍵バイト列を **per-resource-name の Map cache
に 1h 保持** する（`service.ts` の `publicKeyCache` /
`PUBLIC_KEY_TTL_MS`）。

| 戦略 | 反映までの待ち時間 | 影響 |
| ---- | ------------------ | ---- |
| (a) 自然失効を待つ | 最大 1h | 旧鍵 fragment が引き続き返る可能性。緊急性なしの定期 rotation 向け |
| (b) Cloud Run 再起動 | < 1 分 | 即時反映。新鍵での VC 発行を急ぐ場合 |

(b) を選ぶ場合（label 更新で no-op revision を発行 → instance 切替）:

```bash
gcloud run services update civicship-api \
  --region=asia-northeast1 \
  --project=<gcp-project-id> \
  --update-labels=rotated-at=$(date -u +%Y%m%dT%H%M%SZ)
```

### Step 7: 検証

#### 7.1 DID Document に新鍵が出ているか

```bash
curl -s https://api.civicship.app/.well-known/did.json | jq '.'
```

期待:

- `verificationMethod[].id` が `did:web:api.civicship.app#key-N` の形（N = 新 key version）
- `verificationMethod[].publicKeyMultibase` が新鍵の Multikey 表現
- `assertionMethod` / `authentication` がいずれも新 fragment を指す

#### 7.2 新規 VC を 1 件発行

VC 発行 mutation または batch worker を経由して新規 VC を 1 件発行し、JWT
decode で `header.kid` が新 fragment であること、検証が新公開鍵で成功する
ことを確認する。

#### 7.3 旧 VC の検証

Phase 1.5 の single-active-key 配信下では、rotation 直後に旧 VC の検証は
NG になりうる。これは設計上の許容トレードオフであり、Phase 2 で overlap
window が実装されれば解消する。verifier 側のキャッシュ存続期間中のみ
検証可能。

### Step 8: 監査ログとイシュー記録

- KMS の `signEd25519` 呼出 count（GCP audit log）が 24h 後に新
  keyResourceName へシフトしているか確認
- `t_issuer_did_keys` の `activated_at` / `deactivated_at` で履歴が残ること
  を SELECT で確認
- 実施記録を Notion runbook log に記載（時刻 / 実施者 / 旧 keyResourceName
  / 新 keyResourceName / staging 検証結果 / mainnet 適用結果）

---

## 4. ロールバック

新 key で問題が起きた場合（`IssuerDidService` で署名 5xx が増える、
verifier 統合で検証失敗報告など）、**旧 key を ACTIVE に戻す**:

```sql
BEGIN;

UPDATE t_issuer_did_keys
SET status = 'ACTIVE',
    deactivated_at = NULL
WHERE kms_key_resource_name = '<old-keyResourceName>';

UPDATE t_issuer_did_keys
SET status = 'PENDING',
    activated_at = NULL
WHERE kms_key_resource_name = '<new-keyResourceName>';

COMMIT;
```

ロールバック後の対応:

- TTL cache 反映待ち（最大 1h）または Cloud Run 再起動
- ロールバック前の **新鍵で署名された数件の VC** は、旧鍵 ACTIVE の
  Document からは検証 NG。再発行 or StatusList で revoke
- **過去 VC は影響なし**: 旧鍵が ACTIVE に戻った時点で、旧鍵で署名された
  VC は再び検証可能（公開鍵が DID Document に乗る）

---

## 5. 災害復旧（鍵漏洩 / 紛失）

### 5.1 漏洩判定

以下のいずれかに該当した場合は漏洩とみなす:

- KMS audit log に **意図しない signer principal** からの `signEd25519` 呼出
- 自社外の主体が civicship Issuer 署名と整合する VC を発行している
- KMS のサービスアカウント鍵 / Cloud Run runtime SA の credentials 漏洩

### 5.2 緊急 rotation 手順（24h 以内）

1. **新 key 即時生成 + ACTIVE 化**: §3 Step 1〜5 を圧縮実施
2. **Cloud Run 再起動で TTL cache を即時 flush**: §3 Step 6 (b)
3. **旧 key を `disable`**:
   ```bash
   gcloud kms keys versions disable N \
     --keyring=civicship-issuer --location=global --key=did-issuer-key
   ```
4. **DID Document から旧 verificationMethod を削除**: W3C DID-Core では
   `verificationMethod` に `revoked: true` フラグが**ない**ため、id を
   Document から削除する以外に失効を verifier に伝える手段がない。
   Phase 2 で `t_issuer_did_keys` に `status = 'REVOKED'` を立てて
   `verificationMethod[]` から除外する実装を追加予定。Phase 1.5 では旧鍵を
   INACTIVE に降格すると single-active-key 配信の特性上 Document から
   自動的に外れる。
5. **漏洩発覚日付以降の VC を全件 StatusList で revoke**: SQL 直接更新 +
   StatusList VC JWT 再署名（GraphQL revoke mutation は Phase 1.5 持ち越し）。
6. **再発防止**: 漏洩経路（IAM / Secret Manager / SA 鍵 / 開発者端末）監査、
   関連 credentials も rotation。
7. **incident report**: 24h 以内に on-call → CTO → 影響範囲開示。

### 5.3 紛失（KMS 鍵不到達）

- `IssuerDidService.getActiveIssuerDidDocument()` は `null` を返し、router は
  **最小静的 Document を 200 で fallback 配信**
- 新規 VC 発行は `signWithActiveKey` で `Error` throw、明示的に失敗
  （設計上、unsigned VC は emit しない）
- リカバリ後、§3 Step 1〜7 を通常 rotation として実施

---

## 6. 監査ログとメトリクス

### 6.1 GCP KMS audit log

```bash
gcloud logging read \
  'protoPayload.methodName="AsymmetricSign" AND
   resource.type="cloudkms_cryptokey_version" AND
   resource.labels.crypto_key_id="did-issuer-key"' \
  --project=<gcp-project-id> --limit=100 --format=json
```

rotation 完了後、新 cryptoKeyVersion への呼出が 24-48h 以内に大半を占める
ことを確認する。

### 6.2 DB の `t_issuer_did_keys` 履歴

```sql
SELECT id, kms_key_resource_name, status, activated_at, deactivated_at
FROM t_issuer_did_keys
ORDER BY activated_at NULLS FIRST, deactivated_at NULLS LAST;
```

各 key の lifecycle が連続していること（ACTIVE 期間の重なりがないこと）を
都度確認。Phase 2 で overlap window が入ると **意図された重複期間** が
発生するため、その場合は両カラムで overlap 期間を後追い検証可能にする。

### 6.3 アラート（Phase 1.5）

| メトリクス | 閾値 | アクション |
| ---------- | ---- | ---------- |
| `getActiveIssuerDidDocument` returns `null` | > 0 / 5min（本番） | on-call → DB の `t_issuer_did_keys` 確認 |
| `[IssuerDidService] no active issuer key` ログ | >= 1 / 5min（本番） | 同上 |
| KMS `AsymmetricSign` 5xx | >= 1 / 5min | on-call → KMS quota / IAM 確認 |
| `signWithActiveKey` throw | >= 1 / 5min | on-call → DB ACTIVE key 不在を疑う |

> Phase 2 で overlap window 実装後は、`listActiveKeys()` が返す件数の監視
> （通常 1、overlap 中 2、3 以上は異常）を追加する。

---

## 7. 関連ドキュメントとリンク

### 7.1 設計参照

[`docs/report/did-vc-internalization.md`](../report/did-vc-internalization.md)
の §5.4.3 / §9.1 / §9.1.2 / §9.1.3 / §9.1.5 / §16 / §18。

### 7.2 関連コード

- `src/application/domain/credential/issuerDid/service.ts` — `IssuerDidService`
- `src/application/domain/credential/issuerDid/data/type.ts` — `IssuerDidKeyRow`
- `src/application/domain/credential/issuerDid/data/interface.ts` — `IIssuerDidKeyRepository`
- `src/infrastructure/libs/did/issuerDidBuilder.ts` — DID Document 組立
- `src/infrastructure/libs/kms/kmsSigner.ts` — KMS 署名ラッパ

### 7.3 別系統の鍵 runbook（混同しないこと）

- [`docs/operations/anchor-batch-deploy-checklist.md`](../operations/anchor-batch-deploy-checklist.md)
  — **Cardano platform wallet 鍵**（`CARDANO_PLATFORM_PRIVATE_KEY_HEX`）の運用。
  これは Issuer DID 鍵とは別系統で、tx 署名にのみ用いる。本 runbook の対象は
  **Issuer DID 鍵（Ed25519, KMS 管理）** であり、Cardano wallet 鍵ではない。

### 7.4 Phase 2 で本 runbook に追記する項目

Phase 2 の §G overlap multi-key 仕様（設計 §16）が実装されたら追記する:
Step 4 の overlap window 開始手順の有効化 / 24h grace 経過後の旧鍵
INACTIVE 化スケジュール / `listActiveKeys()` が複数件を返す前提での
DID Document 形状確認 / 設計 §G の図解（Day -1 / Day 0 / Day 1+）に沿った
実運用例。
