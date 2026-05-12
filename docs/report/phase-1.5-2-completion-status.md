# Phase 1.5 / Phase 2 Completion Status

`docs/report/did-vc-internalization.md` の §16（Phase 2 / 1.5 持ち越し）/ §11 Phase 0 残課題 0-4 の進捗スナップショット。

**最終更新**: 2026-05-12

> 本文 §16 の表自体は本ファイルとは別の小規模 doc PR で更新する予定（main 設計書はサイズが大きいため一括 commit 不可、本ファイルで status のみ先行公開）。

## Phase 1.5 持ち越し — 全 6 PR merge 済

| 項目 | PR | base に merge 後の SHA |
|------|----|----------------------|
| `VcIssuanceStatus.REVOKED` enum + `@@index([userId, createdAt Desc])` | **#1108** | `c90960b7` |
| issuer-did-key-rotation runbook | **#1109** | `1f240b3a` |
| `/vc/:vcId/inclusion-proof` の本実装 | **#1110** | `4ac598ff` |
| GraphQL `Mutation.revokeUserVc` | **#1111** | `ee3092c5` |
| Phase 1 integration test 解禁 (real DB) | **#1112** | `ef66af66` |
| DataLoader 追加 (UserDidAnchor / VcIssuance) | **#1113** | `d5b2166c` |

base branch head: `103a7b0f` (Phase 1.5 6 PR + develop merge)

## Phase 2 並列着手 — 4 PR 起票済（merge 待ち）

| 項目 | PR | head SHA | CI |
|------|----|---------|-----|
| §G overlap multi-key (issuer DID Document に旧鍵並列配信) | **#1120** | `b8bd86c9` | Sonar/Snyk passed |
| `documentCbor` の chain inclusion (§8.3) | **#1119** | `e0333e85` | Sonar/Snyk passed |
| `JwtSigner` interface 抽出 (Phase 2 KMS 切替の下準備) | **#1121** | `63c0b758` | Sonar/Snyk passed |
| 第三者検証スクリプト (Phase 0 残課題 0-4) | **#1118** | `2ea2ac3f` | Sonar/Snyk passed |

### 各 PR の Gemini レビュー対応サマリ

- **#1118**: Merkle 説明を duplicate-last に訂正、`substr` → `slice`
- **#1119**: `Buffer` を plain `Uint8Array` に強制変換するため `constructor === Uint8Array` 比較に変更（`Buffer` は `Uint8Array` のサブクラスなので `instanceof Uint8Array` だと再ラップが no-op になり、コメント記載の "normalize to plain Uint8Array" 意図と不一致だった）、`trimDocCborForSizeBudget` の in-place mutation 化
- **#1120**: `listCryptoKeyVersions` pagination 対応 (HIGH)、`getPublicKey` / `fetchPublicKeyHex` 並列化、`hexToBytes` を per-pair regex (`/^[0-9a-fA-F]{2}$/`) で厳密検証（`Number.isNaN(parseInt(...))` だけだと `"1z"` のような部分一致を見逃すため、issuerDidBuilder.ts の sibling helper と完全に同じ実装に揃えた）、`base64UrlEncode` を Node native `Buffer.toString("base64url")` に置換 (SonarCloud S5852 hotspot 解消)
- **#1121**: `JwtSigner` に `alg` property 追加、`StubJwtSigner` / `KmsJwtSigner` 実装、`vcIssuance/service.ts` / `statusList/service.ts` の hard-coded `"EdDSA"` を `signer.alg` 参照に統一、base64url 文字説明の訂正

## Phase 2 で残る項目

設計書 §16 のうち、本セッションでは扱わない（別 sprint / infra 作業前提）:

| 項目 | 状態 | 待ち事項 |
|------|------|---------|
| KMS 経由 Cardano tx 署名 (vkey witness 手動 attach) | 未着手 | Phase 0-2 KMS Ed25519 PoC 完了待ち |
| VC JWT / StatusList JWT の本番 KMS 署名 | interface のみ完了 (#1121) | 同上 — `KmsJwtSigner.sign()` body 実装 + DI rebind の 1 PR で完結 |
| `runBatch` を fire-and-forget 化 (Cloud Tasks 分離) | 未着手 | Cloud Tasks queue 作成 + IAM 設定の infra 作業が前提 |

## Phase 0 残課題

| # | 内容 | 状態 |
|---|------|------|
| 0-2 | KMS Ed25519 で Cardano tx / VC JWT 署名の両用 PoC | **未実施**（環境準備が必要） |
| 0-4 | 第三者検証スクリプト | **コード完了 #1118** — 受け入れ走行は preprod 実 tx 投入後 |

## Open Questions（変更なし）

設計書 §13 のうち以下が引き続き open:
- **Q6**: 独自 cryptosuite `civicship-merkle-anchor-2026` の spec 公開（後回し可）
- **Q10**: DID Document chain 格納戦略の運用 6 ヶ月後評価
- **Q11**: StatusList 自体の Cardano anchoring（Phase 2 後）
- **Q12**: EU ユーザー対応時の GDPR 削除フロー（Phase 4 後）
- **Q13**: GCP KMS `global` location 権限確認（Phase 0 着手前提）

## 次の sprint で取り組むべきこと

1. **Q13 完了** (GCP プロジェクト権限確認) — ユーザー作業
2. **Phase 0-2 KMS PoC** — KMS 環境準備後
3. **Cloud Tasks infra** — DevOps 作業
4. **本 4 PR (#1118-1121) merge** — レビュー後 squash merge
5. **Phase 0-4 受け入れ走行** — preprod 実 tx 投入時に `scripts/verify-from-chain.ts` を回す
