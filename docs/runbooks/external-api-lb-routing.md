# External API を公開ロードバランサに配線する Runbook

業者向け External API (`src/external-api.ts` / Cloud Run `*-civicship-external-api`)
を、公開ホスト `api.civicship.app` の `/api/*` パス経由で到達可能にする手順書。

関連コード:

- `src/external-api.ts` — External API のエントリポイント（`/api` 配下に
  `walletRouter` / `nftTokenRouter` / `nftInstanceRouter` をマウント）
- `src/presentation/router/wallet.ts` — `/api/nft-wallets/*` 定義
- `src/presentation/middleware/api-key-auth.ts` — `X-API-Key` ヘッダ認証
- `src/presentation/middleware/api-key-vendor.ts` — ApiKey ↔ NftVendor 紐付け検証

> **背景（このrunbookが生まれた経緯）**: NFT系エンドポイント公開時、コードは
> master にマージされ Cloud Run へデプロイされたが、**External API を公開LBに
> 配線する作業（NEG → backend service → url-map path rule）が dev / prd 両方
> とも未実施**だった。結果 External API は `*.run.app` 生URLでしか到達できず、
> `api.civicship.app/api/*` は Internal API に落ちて `404 Cannot POST` を返して
> いた。本runbookはその配線を確立する。

---

## リクエスト経路と関門（層構造）

`api.civicship.app` 宛リクエストが通る層と、それぞれの設定の所在地:

```text
Client
  → ① Cloudflare (Proxied, Bot Fight Mode)   … Cloudflareダッシュボード / gitの外
  → ② GCP HTTPS LB + Cloud Armor              … gcloud compute（本runbookの対象）
  → ③ Cloud Run (internal / external)         … 各サービスのアプリ層
```

- **①** はゾーン設定で、Proxied なホストにのみ効く。`api.civicship.app` は
  Proxied なので Bot Fight Mode の Managed Challenge (403 `Just a moment...`)
  が S2S クライアント（ブラウザでない業者サーバ）を誤爆しうる。
- **②** の url-map (`prod-civicship-alb-url-map`) の `api-matcher` が、
  デフォルトで **全パスを Internal backend (`prod-civicship-backend`) に送る**。
  `/api/*` を External backend に振る path rule が無いと 404 になる。
- **③** の認証は `X-API-Key` (`api-key-auth.ts`) + NftVendor 紐付け
  (`api-key-vendor.ts`)。**これが実質的なアクセス制御の境界**。

## 切り分け早見表（症状 → 犯人層）

| 症状 | 犯人 |
| --- | --- |
| 403 + body が `Just a moment...` / `challenges.cloudflare.com` | ① Cloudflare Bot Fight Mode |
| 404 + body が `Cannot POST /api/...`（Express既定404） | ② url-map が Internal に誤ルーティング |
| 401 `{"error":"Invalid API key"}` | ③ まで到達成功（無効/未登録キー）。ルーティングは正常 |
| 403 `{"error":"API key is not associated with a vendor"}` | ③ NftVendor 未紐付け |
| 401 `{"error":"Firebase ID token is required"}` | ③ まで到達成功（`/nft-wallets/link` は Firebase 認証も要求） |
| 403 (GCP HTML) / timeout（生URL直叩き時） | Cloud Run ingress or IAM invoker 制限 |

---

## 配線手順（prd 例）

前提の実体（2026-07 時点）:

- プロジェクト: `co-creation-dao-prod`
- External Cloud Run: `prod-civicship-external-api`（region `us-central1`）
- url-map: `prod-civicship-alb-url-map`、`api.civicship.app` → pathMatcher `api-matcher`
- Internal backend: `prod-civicship-backend`
- Cloud Armor: `prod-civicship-alb-security-policy`

```bash
# STEP 0: 既存 Internal backend を見本に scheme / policy を採取
gcloud compute backend-services describe prod-civicship-backend \
  --project co-creation-dao-prod --global \
  --format='yaml(loadBalancingScheme,protocol,securityPolicy,timeoutSec)'

# STEP 1: External Cloud Run 用 Serverless NEG（External と同じ region）
gcloud compute network-endpoint-groups create prod-civicship-external-serverless-neg \
  --project co-creation-dao-prod --region us-central1 \
  --network-endpoint-type serverless \
  --cloud-run-service prod-civicship-external-api

# STEP 2: backend service 作成
#   ★ --load-balancing-scheme / --protocol は STEP 0 で採取した Internal backend の
#      値に必ず合わせる（下記は既定構成での想定値。STEP 0 の出力が異なれば置き換える）。
#      scheme が LB のフォワーディングルールと不一致だと backend が紐付かない。
gcloud compute backend-services create prod-civicship-external-backend \
  --project co-creation-dao-prod --global \
  --load-balancing-scheme EXTERNAL_MANAGED --protocol HTTP   # ← STEP 0 の値に合わせる

# STEP 3: NEG を紐付け
gcloud compute backend-services add-backend prod-civicship-external-backend \
  --project co-creation-dao-prod --global \
  --network-endpoint-group prod-civicship-external-serverless-neg \
  --network-endpoint-group-region us-central1

# STEP 4: Internal と同じ Cloud Armor ポリシーを付与
gcloud compute backend-services update prod-civicship-external-backend \
  --project co-creation-dao-prod --global \
  --security-policy prod-civicship-alb-security-policy

# STEP 5: url-map をエクスポート（★原本を必ずバックアップ）
gcloud compute url-maps export prod-civicship-alb-url-map \
  --project co-creation-dao-prod --destination /tmp/urlmap.yaml
cp /tmp/urlmap.yaml /tmp/urlmap.backup.yaml
```

**STEP 5 後、`/tmp/urlmap.yaml` の `api-matcher` に `pathRules` を追記**
（`defaultService` は変更しない = `/api/*` 以外は Internal のまま）:

```yaml
  - defaultService: https://www.googleapis.com/compute/v1/projects/co-creation-dao-prod/global/backendServices/prod-civicship-backend
    name: api-matcher
    pathRules:
    - paths:
      - /api
      - /api/*
      service: https://www.googleapis.com/compute/v1/projects/co-creation-dao-prod/global/backendServices/prod-civicship-external-backend
```

```bash
# STEP 6: 反映
gcloud compute url-maps import prod-civicship-alb-url-map \
  --project co-creation-dao-prod --source /tmp/urlmap.yaml

# STEP 7: 検証（反映に数分）
curl -i -X POST https://api.civicship.app/api/nft-wallets/link \
  -H "Content-Type: application/json" -H "X-API-Key: <key>" -d '{}'
#   → {"error":"Invalid API key"} または {"error":"Firebase ID token is required"} = 成功（External に到達）
#     ※ apiKeyAuthMiddleware が先に走るため、有効な本番キーが無くても JSON が返れば到達成功。
#        401 "Invalid API key"（無効キー）/ 401 "Firebase ID token is required"（有効キーで次段停止）
#        いずれも External に届いた証拠で、Internal の 404 Cannot POST を回避できている。
#   → 404 Cannot POST = 未反映 or pathRule 誤り
```

## ロールバック

```bash
gcloud compute url-maps import prod-civicship-alb-url-map \
  --project co-creation-dao-prod --source /tmp/urlmap.backup.yaml
```

---

## 注意点 / 既知の落とし穴

1. **`pathRules` 追加は加算的**。`defaultService` を変えなければ `/graphql` /
   `/.well-known` / did.json 等の Internal ルートは影響を受けない。Internal 側に
   `/api` で始まる公開ルートは無いため衝突しない（`src/index.ts` のマウント参照）。
2. **Bot Fight Mode はオフのまま維持する**。`api.civicship.app` は Cloudflare
   Proxied 配下のため、BFM を ON に戻すと業者の S2S 通信が Managed Challenge
   (403) で再び弾かれる。Free プランでは `/api/*` をパス単位で BFM 除外できない
   （Skip 可能なのは Pro 以上の Super Bot Fight Mode のみ）。恒久的に BFM 保護を
   戻したい場合は (a) 業者が Vercel Static IPs で固定 egress IP を提示 → IP
   Access Rule で Allow、または (b) Cloudflare Pro 化、のいずれか。
3. **Cloud Armor の `RATE_BASED_BAN` ルール**が preview から enforce に変わる際、
   S2S トラフィックを誤 ban しないかレビューすること。
4. **region 整合**: Serverless NEG は External Cloud Run と同一 region で作る。

## 暫定回避（配線前に業者を通す場合）

External Cloud Run は `allUsers` に `roles/run.invoker` が付いており、生URL
（`https://<service>-<num>.<region>.run.app`）を直接叩けば到達する。ただし
Cloudflare も Cloud Armor も通らず**オリジン直晒し**（守りは `X-API-Key` 認証
のみ）になるため、あくまで暫定運用とし、本配線後は生URL利用を停止する。

### 本配線完了後の締め（暫定回避の解除）★必須

暫定回避のまま放置するとオリジンが恒久的に直晒しで残る。**本配線（STEP 1〜7）が
検証まで完了したら、Cloud Run の ingress を絞って生URL直叩きを塞ぐ**こと:

```bash
gcloud run services update prod-civicship-external-api \
  --project co-creation-dao-prod --region us-central1 \
  --ingress internal-and-cloud-load-balancing
#   → 生 *.run.app への外部直アクセスは 403 になり、LB 経由のみ到達可能になる
```

> **`allUsers` の `roles/run.invoker` は削除しないこと。** Serverless NEG 経由の
> LB は Cloud Run に認証トークンを付与しないため、invoker を外すと **LB 経由の
> 正規トラフィックまで 403 で落ちる**。直晒しを閉じる正しいレバーは上記の
> **ingress 制限**であって invoker 削除ではない。ingress を
> `internal-and-cloud-load-balancing` にすれば、生URLは塞がれつつ LB 経由は
> `allUsers` invoker で通る、という組み合わせが成立する。

反映後、`api.civicship.app/api/*`（LB経由）は STEP 7 と同じレスポンスで到達でき、
生URL直叩きは 403 になることを確認する。

## 再発防止

- External API を新規環境に出す際は「Cloud Run デプロイ」だけでなく
  「NEG → backend service → url-map path rule」までを公開手順に含める。
- 可能なら url-map / backend service を IaC 化し、dev / prd の構成ドリフトを防ぐ
  （本件は dev / prd 双方が未配線 = 手作業運用で漏れていた）。
