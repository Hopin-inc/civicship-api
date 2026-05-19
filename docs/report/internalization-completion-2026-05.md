# DID/VC Internalization — Completion Report (2026-05)

設計書 [`did-vc-internalization.md`](./did-vc-internalization.md) (~2,400 行) の
**進捗 / 完了状況 / 残課題** を一覧化する補完ドキュメント。原設計書は史料
として保持し、現実との突き合わせは本書で行う。

> **本書のスコープ**: 内製化 epic (`epic/replace-identsu`) で `did:prism` →
> `did:web` 移行と Cardano metadata 1985 anchor の自前実装が完了した時点
> (2026-05) の総括。Phase 0 PoC〜Phase 3 cutover backfill までを対象とする。

---

## 1. Phase 進捗マトリクス

| Phase | 設計書 § | 内容 | 状態 |
|---|---|---|---|
| **0** | §11 Phase 0 | PoC 6 項目 (preprod submit / KMS Ed25519 / did:web resolver / 第三者検証 script / GIN index / CIP-10 label 1985) | ✅ 完了 (一部は本 epic 中で消化、§9.0-1〜0-6 参照) |
| **1** | §11 Phase 1 | 内製発行コード一式を main に merge、`INTERNAL_DID_VC_ENABLED=false` で配置 | ✅ 完了 |
| **1.5** | §16 / phase-1.5-2 status | StatusList 2021、KmsJwtSigner placeholder、verify 経路整備 | ✅ 完了 |
| **2** | §16 | KmsJwtSigner 本実装 + DI swap | ✅ 完了 (PR #1142) |
| **3 (Day 1)** | §11 Phase 3 | 既存ユーザの INTERNAL DID 一括 INSERT / Transaction Merkle 1 tx backfill / DID anchor backfill | ✅ 完了 (dev preprod 実行済、§3.2 参照) |
| **3 (Day 2)** | §11 Phase 3 | 全 anchor CONFIRMED 確認 / 第三者検証 / IDENTUS OFF | ⚠️ 半分 (検証は通った、`INTERNAL_DID_VC_ENABLED` の OFF→ON 切替判断は prd リリース時) |
| **4** | §11 Phase 4 | IDENTUS 撤去 (`requestDIDVC` / `syncDIDVC` 系コード削除 / env 削除 / VM shutdown) | 🟡 部分 (PR #1143 で orphan helper 606 行削除、core client は残置) |

---

## 2. 成功基準達成状況 (§1.3)

| # | 基準 | 達成 | 根拠 |
|---|---|:---:|---|
| 1 | `/point/verify` が外部 HTTP 呼び出しゼロでローカル DB 参照のみで応答 | ❌ | `src/infrastructure/libs/point-verify/client.ts:55` が依然 `IDENTUS_API_URL` に call。**未消化、別途 PR 必要** |
| 2 | 新規 DID/VC が IDENTUS API を一切呼ばずに発行される | ✅ | `VcIssuanceService.issueVc` → `KmsJwtSigner`。`DIDVCServerClient` (`src/infrastructure/libs/did.ts`) は呼び出し元なし |
| 3 | 任意の第三者が Cardano explorer + HTTPS GET だけで DID/VC の存在・内容を独立検証できる | ✅ | metadata label 1985 / `/.well-known/did.json` / `/users/:id/did.json` (proof 付き) / `/vc/:id/inclusion-proof` で確認可能 |
| 4 | DID の鍵ローテ・deactivate が Cardano 上に追跡可能な履歴として記録 | ✅ | `UserDidAnchor.operation` (CREATE/UPDATE/DEACTIVATE) → metadata 1985 ops[] |
| 5 | 月額運用コスト ≤ $5/月 | ✅ | Blockfrost free tier + KMS 一鍵 ($0.06) + tx 手数料 ($0.5) ≒ $1/月 |
| 6 | 既存 GraphQL schema (`DidIssuanceRequest` / `VcIssuanceRequest`) への破壊的変更ゼロ | ✅ | 型・enum 共に保持 (`IDENTUS_VC_PRISM` enum は legacy 互換) |
| 7 | `/point/verify` レスポンス形 (`{ txId, status, transactionHash, rootHash, label }`) は維持 | ✅ | response shape そのまま |

**合計**: ✅ 6 / ⚠️ 0 / ❌ 1 → **85% 達成**。残るは #1 のみ。

---

## 3. 内製化エポックで merge した PR 一覧

### 3.1 Step A — DI 修復

| PR | 内容 |
|---|---|
| #1137 | `fix(provider): wire BlockfrostClient via factory` — interface 引数を tsyringe が auto resolve できない問題の修正 |

### 3.2 Step B / C — 運用スクリプト整備 + preprod e2e PoC

| PR | 内容 |
|---|---|
| #1138 | platform address derive + preprod e2e submit scripts |
| #1139 | sample anchor metadata builder の重複解消 |
| #1140 | reflect-metadata 読込 fix |
| #1141 | `BlockfrostClient.getUtxos` 404 → `[]` |
| **#1144** | KMS sign-and-verify round-trip script |

**Step C 動作確認**:
- preprod tx `7d6c59f2f49d77da1b054643fe7ff2f01a7f22c93a6f7bcd48f8903447ccd11f` (CONFIRMED, block 4,700,988)
- 連続 submit tx `6701f7cdee2b4d001898f0362e79e6013ada14f626a5c5f992beb3cdab028b46` (UTxO chaining 動作確認)

### 3.3 Step D — KmsJwtSigner 本実装

| PR | 内容 |
|---|---|
| #1142 | `feat(credential): wire KmsJwtSigner for production VC / StatusList signing` — DI swap (Stub → KMS)、`JwtSigner.prepare()` 追加、テスト下では `JEST_WORKER_ID` で stub fallback |
| #1146 | dev VC issuance e2e PoC script |
| #1147 | dev-issue-vc に `x-community-id` header 付与 |

**Step D 動作確認**: dev API に対する実 `issueVc` mutation → 発行 VC を `/.well-known/did.json` の Ed25519 pubkey で検証 PASS (vcId `cmp3cbn8b0001s601kx4dmr17`)。

### 3.4 Step E — 旧 IDENTUS helper 削除

| PR | 内容 |
|---|---|
| #1143 | `chore(batch): remove orphan legacy IDENTUS helper modules` — `syncDIDVC/{syncDID,syncVC,utils}.ts` + `requestDIDVC/{requestDID,requestVC}.ts` 計 606 行削除 |

> entry index.ts は保持 (batch.ts から呼び続けるため)。
> `DIDVCServerClient` (`src/infrastructure/libs/did.ts`) と `IDENTUS_API_URL` const は **未消化** (point-verify と GraphQL schema enum が依存中)。

### 3.5 Phase 3 Day 1 — 既存データ backfill

| PR | 内容 |
|---|---|
| #1148 | `resign-stub-vcs` — stub-signed VC を KMS 署名で再生成 (dev で 0 件、即時 NO-OP) |
| #1149 | `backfill-transaction-anchor` — 全 Transaction を 1 Cardano tx で集約 anchor |
| #1150 | `backfill-user-did` — 全 user に INTERNAL DID INSERT + chunked Cardano anchor |
| #1152 | `backfill-user-did` の Prisma 5s tx timeout fix |

**実行結果 (dev preprod、2026-05-13)**:
- Transaction anchor 154 件 → tx `8165572e948be4e32ea1609e11deac193c5d721ed6ec788fd2f61c05dc76f2aa` (block 4,702,988, CONFIRMED)
- User DID 27 user (= dev の全 user without INTERNAL) → tx `7c327af024f852ef4e85816b6b7c9f4b2e66f86280aadaa0f217f725bc2e8afa` (block 4,703,014, CONFIRMED, 6886 B metadata)
- `/users/<id>/did.json` で proof 付き Document 配信を確認 (anchorStatus: `confirmed`, anchorTxHash 付き)
- Stub VC resign: dev に該当 0 件 (Phase 1 → 2 シームレス)

### 3.6 障害復旧

| PR | 内容 |
|---|---|
| #1151 | `fix(deps): restore @google-cloud/kms to runtime dependencies` — devDeps への誤移動で dev Cloud Run 起動失敗 → 復旧 |

---

## 4. 機能パリティ表 (IDENTUS-era → 内製)

| 領域 | 旧 (IDENTUS) | 新 (内製) | 状態 |
|---|---|---|---|
| **DID 方式** | `did:prism:<long opaque>` | `did:web:api.civicship.app:users:<cuid>` | ✅ |
| **DID 発行 trigger** | `requestDIDVC` batch → IDENTUS async job | GraphQL mutation 同期 or backfill script | ✅ |
| **DID Document 配信** | IDENTUS Cloud Agent | civicship-api Express router | ✅ |
| **DID 操作履歴** | PRISM 内部管理 | Cardano metadata 1985 ops[] | ✅ |
| **VC format** | `IDENTUS_VC_PRISM` (IDENTUS 専用 JWT) | `INTERNAL_JWT` (W3C VC JWT) | ✅ |
| **VC 署名** | IDENTUS key | Cloud KMS Ed25519 | ✅ |
| **VC 失効** | IDENTUS revocation list | W3C Bitstring Status List 2021 | ✅ |
| **Merkle root commit** | civicship が計算 → IDENTUS が Cardano に書込 | civicship が Blockfrost 経由で直接 Cardano に書込 | ✅ |
| **`/point/verify`** | IDENTUS API HTTP call | **未置換、IDENTUS_API_URL 参照中** | ❌ |
| **第三者検証** | 不可能 (IDENTUS 内部) | Cardano explorer + HTTPS GET で完結 | ✅ |
| **GraphQL schema (`DidIssuanceRequest` / `VcIssuanceRequest`)** | IDENTUS バックエンド前提 | shape 維持、`didMethod` / `vcFormat` enum で内製区別 | ✅ |
| **運用コスト** | IDENTUS VM ($数十/月) | Blockfrost + KMS ($1/月) | ✅ |
| **legacy enum 露出** | `IDENTUS_VC_PRISM` | 保持 (public API breaking change 回避) | ✅ |

---

## 5. 非ゴール達成状況 (§1.2)

| 非ゴール | 達成 | 根拠 |
|---|:---:|---|
| 既発行 `did:prism:...` を書き換えない | ✅ | 旧 row は履歴として残置、新規 `INTERNAL` row を別途 INSERT |
| `t_merkle_commits` / `t_merkle_proofs` に新規書込なし | ✅ | 新方式は `t_transaction_anchors` / `t_vc_anchors` / `t_user_did_anchors` を使用 |
| 既存テーブルへの破壊的スキーマ変更なし | ✅ | 全カラム NULL 許容 or default 付きで追加 |
| self-sovereign DID 切替なし (platform-issued 維持) | ✅ | DID Document の controller は依然 platform issuer |
| `EvaluationCredential` データモデル変更なし | ✅ | 流用、claims を opaque 通過 |

---

## 6. 残課題

### 6.1 ❌ 致命 (成功基準未達)

| 項目 | 内容 | 推定工数 |
|---|---|---|
| **`/point/verify` 内製化** | `src/infrastructure/libs/point-verify/client.ts:55` が `IDENTUS_API_URL` を呼び続けている。`t_transaction_anchors.leaf_ids` の GIN index で local resolve 可能 (PoC §0-5 で 17-27× 高速化を実測済)。`PointVerifyClient` を local lookup に置換する PR が必要 | 0.5〜1 日 |

### 6.2 🟡 中 (運用 readiness)

| 項目 | 状態 |
|---|---|
| ドメイン hardening (DNSSEC / CAA / HSTS preload) | 別エージェントへ delegation 済 |
| `INTERNAL_DID_VC_ENABLED` feature flag の prd 切替 | prd release 計画 (Phase 3 Day 2) と連動 |
| `epic/replace-identsu` → `develop` 統合 PR | cardano-canary CI を develop 上で有効化するため必要 |
| prd 環境 (`co-creation-dao-prod`) の同等 setup | KMS / `t_issuer_did_keys` row / Secret / Cloud Run env / wallet 入金 |
| `INTERNAL_DID_VC_ENABLED` の **prd OFF→ON 切替** | prd cutover 完了の最終ステップ |

### 6.3 🟢 低 (技術負債、Phase 4 にまとめて処理)

| 項目 | 状態 |
|---|---|
| `DIDVCServerClient` (`src/infrastructure/libs/did.ts`) 完全削除 | `/point/verify` 内製化と同時に実施 |
| `IDENTUS_API_URL` / `IDENTUS_API_KEY` / `IDENTUS_API_SALT` env 撤去 | 同上 |
| `IDENTUS_VC_PRISM` enum 撤去 | GraphQL breaking change のため major version bump 時 |
| `identus-cloud-agent-vm` shutdown | Phase 4 確定後 |
| dev Cloud Run の `IDENTUS_API_URL` env 残留 | 無害 (新 anchor batch では未参照)、Phase 4 cleanup で撤去 |
| `kyoso-dev-civicship-batch-scheduler-request-did-vc` Cloud Scheduler job | PAUSED 想定、削除推奨 |

### 6.4 📘 運用ドキュメント

| 項目 | 状態 |
|---|---|
| [`docs/runbooks/issuer-did-key-rotation.md`](../runbooks/issuer-did-key-rotation.md) | ✅ 整備済 (Phase 1.5 scoped、Phase 2 overlap window は TODO 明記) |
| [`docs/runbooks/blockfrost-api-key-rotation.md`](../runbooks/blockfrost-api-key-rotation.md) | ✅ 本 PR で追加 |
| [`docs/operations/anchor-batch-deploy-checklist.md`](../operations/anchor-batch-deploy-checklist.md) | ✅ 既存 |
| 監視・アラート (Cloud Monitoring) | 未文書化、年次運用前に必要 |
| Cardano Hard Fork SOP | 設計書 §11 末尾に箇条書きあり、独立 doc 化は未 |

---

## 7. 運用ハンドオフチェックリスト

prd リリース時にユーザー側で実施する必要があること:

- [ ] prd KMS key version 1 を払い出し、Cloud Run SA に `signerVerifier` 付与
- [ ] prd `t_issuer_did_keys` に初期 row INSERT
- [ ] prd Secret Manager に `BLOCKFROST_PROJECT_ID` / `CARDANO_PLATFORM_PRIVATE_KEY_HEX` / `CARDANO_PLATFORM_ADDRESS` / `CARDANO_NETWORK=preprod` 投入
- [ ] prd Cloud Run Service / Job に env 配線 (`co-creation-dao-prod` GH environment 経由)
- [ ] prd platform wallet (preprod faucet で 100 tADA 入金推奨、dev wallet と別 address)
- [ ] prd Cloud Scheduler `kyoso-prd-civicship-batch-scheduler-sync-did-vc` を週次 cron で起動
- [ ] dev で実施した backfill 3 script を prd で順次実行 (Day 1 手順)
- [ ] DNSSEC / CAA / HSTS preload を `api.civicship.app` で有効化
- [ ] `/point/verify` 内製化 PR を merge (成功基準 #1 達成)
- [ ] `INTERNAL_DID_VC_ENABLED=true` で prd 切替 (Phase 3 Day 2)
- [ ] Phase 4 (IDENTUS 完全撤去) を別スプリントで実施

---

## 8. 設計書の section ↔ 実装の対応 (Quick Reference)

| 設計書 § | 実装ファイル / PR |
|---|---|
| §3.3 (CBOR DID Document) | `src/infrastructure/libs/did/userDidBuilder.ts` |
| §4.1 (TransactionAnchor / VcAnchor / UserDidAnchor schema) | `src/infrastructure/prisma/schema.prisma` |
| §5.1.5 (`BlockfrostClient`) | `src/infrastructure/libs/blockfrost/client.ts` |
| §5.1.6 (metadata 1985 / 16KB ceiling / 64B chunking) | `src/infrastructure/libs/cardano/txBuilder.ts` |
| §5.1.7 (Blake2b-256 Merkle) | `src/infrastructure/libs/merkle/merkleTreeBuilder.ts` |
| §5.2.2 (VcIssuanceService) | `src/application/domain/credential/vcIssuance/service.ts` |
| §5.2.3 (Anchor domain) | `src/application/domain/anchor/anchorBatch/` |
| §5.2.4 (StatusListService) | `src/application/domain/credential/statusList/service.ts` |
| §5.3.1 (weekly batch + idempotency) | `src/application/domain/anchor/anchorBatch/service.ts:runWeeklyBatch` |
| §5.4 (DID router) | `src/presentation/router/did.ts` |
| §5.4.3 (IssuerDidService + KMS) | `src/application/domain/credential/issuerDid/service.ts` |
| §5.4.6 (`/vc/:id/inclusion-proof`) | `src/presentation/router/did.ts:200-236` |
| §7 (revocation / Bitstring Status List) | `src/application/domain/credential/statusList/` |
| §9.1 (鍵管理 / KMS) | `src/infrastructure/libs/kms/kmsSigner.ts` + `KmsJwtSigner` |
| §G (鍵 rotation overlap) | `docs/runbooks/issuer-did-key-rotation.md` (Phase 2 で `verificationMethod[]` 並列配信に拡張) |
| §11 Phase 3 (backfill) | `scripts/backfill-transaction-anchor.ts` + `scripts/backfill-user-did.ts` |
| §16 (Phase 2 carryover) | PR #1142 (KmsJwtSigner) で大半消化 |
| §18 (KMS 鍵リング設計) | 設計書記載、prd 実装は運用作業 |

---

## 9. 関連ドキュメント

- 原設計書: [`docs/report/did-vc-internalization.md`](./did-vc-internalization.md)
- Phase 1.5 / 2 進捗: [`docs/report/phase-1.5-2-completion-status.md`](./phase-1.5-2-completion-status.md)
- 運用 runbook:
  - [`docs/runbooks/issuer-did-key-rotation.md`](../runbooks/issuer-did-key-rotation.md)
  - [`docs/runbooks/blockfrost-api-key-rotation.md`](../runbooks/blockfrost-api-key-rotation.md)
- 運用 checklist: [`docs/operations/anchor-batch-deploy-checklist.md`](../operations/anchor-batch-deploy-checklist.md)
