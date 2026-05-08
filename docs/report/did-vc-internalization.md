# DID/VC 内製化 設計書

外部委託している Hyperledger IDENTUS（旧 Atala PRISM）から脱却し、DID/VC 発行を自前で署名・公開台帳アンカリングする設計案。

- 作成日: 2026-05-08
- 対象ブランチ: `claude/did-vc-internalization-review-eptzS`
- 前提: 「ブロックチェーン上の公開台帳は事業要件として必須」
- 想定公開台帳: **Solana Mainnet**（Memo Program 利用、契約デプロイ不要）

---

## 1. 目的とゴール

### 1.1 目的
- IDENTUS への依存を排除し、運用コスト・障害ポイント・ベンダーロックインを削減する
- DID/VC の暗号学的同値性を保ったまま、内部実装で同等以上の保証を提供する
- 評価証跡を**改ざん不能な公開台帳に記録する事業要件**を、より安価かつ標準化された手段で達成する

### 1.2 非ゴール
- 既存の DID 値・VC を「移行」して新方式に書き換えること（既発行は IDENTUS 形式のまま据え置く。新規分から内製方式）
- ユーザーへのウォレット配布・自己管理 DID（self-sovereign）への切替（あくまで platform-issued）
- 革新的な VC データモデル変更（既存 `EvaluationCredential` 構造はそのまま流用）

### 1.3 成功基準
- 新規 DID/VC が IDENTUS API を一切呼ばずに発行される
- 第三者が公開台帳上で評価VCの存在・順序を独立検証できる
- 月額運用コストが **$10/月以下** に収まる（現行費用比で大幅削減）
- 既存 GraphQL スキーマ（`DidIssuanceRequest` / `VcIssuanceRequest`）への破壊的変更ゼロ

---

## 2. 現状アーキテクチャ（おさらい）

### 2.1 外部依存
| 依存先 | 用途 | 実装位置 |
|---|---|---|
| IDENTUS API: `POST /did/job/create-and-publish` | DID 作成（Cardano 系チェーンに公開） | `src/infrastructure/libs/did.ts:7` |
| IDENTUS API: `GET /did/job/{jobId}` | 非同期ジョブの状態ポーリング | 同上 |
| IDENTUS API: `POST /vc/connectionless/job/issue-to-holder` | VC 発行（JWT 形式） | 同上 |
| IDENTUS API: `GET /vc/connectionless/job/{jobId}` | VC 発行ジョブの状態ポーリング | 同上 |
| IDENTUS API: `POST /point/verify` | ブロックチェーン上のトランザクション検証 | `src/infrastructure/libs/point-verify/client.ts` |

### 2.2 主要コード資産
- バッチ処理 2 系統:
  - `src/presentation/batch/requestDIDVC/`（DID/VC 発行要求）
  - `src/presentation/batch/syncDIDVC/`（PROCESSING 状態の同期・タイムアウト判定）
- ドメインサービス:
  - `src/application/domain/account/identity/didIssuanceRequest/service.ts`（DID 発行＋トークンリフレッシュ）
  - `src/application/domain/experience/evaluation/vcIssuanceRequest/service.ts`（VC 発行）
- DB: `DidIssuanceRequest` / `VcIssuanceRequest`（`PENDING → PROCESSING → COMPLETED/FAILED`）
- GraphQL: `Query.vcIssuanceRequests` / `Query.vcIssuanceRequest`、`DidIssuanceRequest` 型

### 2.3 現状の構造的特徴
- 非同期ジョブ＋7 日タイムアウト＋リトライ管理（IDENTUS が非同期 API のため）
- ユーザーごとの `Identity.authToken` をリフレッシュする運用
- ブロックチェーンアンカリングは IDENTUS 内部で完結（Cardano 系と推測、ユーザーには可視化していない）

---

## 3. 提案アーキテクチャ

### 3.1 全体像

```
                          ┌──────────────────────────────────┐
                          │   civicship-api (内製発行)       │
                          │                                  │
  Evaluation PASSED ─────▶│  VCIssuanceRequestService        │
                          │   ├─ generateUserDIDIfNeeded     │   (did:key 生成 / DB 保存)
                          │   ├─ buildVCPayload              │   (既存 EvaluationCredential 流用)
                          │   ├─ signVCJWT (GCP KMS)         │   (Issuer DID = did:web:civicship.jp)
                          │   ├─ persistVC (DB)              │   (vc_jwt 保存)
                          │   └─ enqueueAnchorEntry ─────────┼─▶ MerkleAnchorBatcher (内部キュー)
                          └──────────────────────────────────┘
                                                                          │ 集約 (時間 or 件数閾値)
                                                                          ▼
                          ┌──────────────────────────────────┐
                          │  AnchorBatchPublisher (cron)     │
                          │   ├─ build Merkle tree           │
                          │   ├─ sign tx (GCP KMS, ed25519)  │
                          │   └─ submit Solana memo tx ──────┼─▶ Solana Mainnet (Memo Program)
                          │                                  │   memo: "civicship/v1/<batchId>/<merkleRoot>"
                          │   └─ persist {batchId,           │
                          │       merkleRoot, txSignature,   │
                          │       slot, leafProofs}          │
                          └──────────────────────────────────┘
```

### 3.2 設計上の核心判断

| 判断 | 採用 | 却下 | 理由 |
|---|---|---|---|
| Issuer DID method | **`did:web:civicship.jp`** | `did:key`, `did:ion` | ローテーション可能、`/.well-known/did.json` 配信のみで完結、TLS 信頼で十分 |
| Subject (User) DID method | **`did:key:zEd25519...`** | `did:web:user-id` | ユーザー単位で URL を晒さない（プライバシー）、生成コストゼロ、レジストリ不要 |
| VC フォーマット | **W3C VC 1.1 + JWT (`vc+jwt`)** | JSON-LD LD-Proof, SD-JWT VC | 現行 IDENTUS と同じ JWT、`did-jwt-vc` で実装容易、検証ツール充実 |
| 署名鍵保管 | **GCP KMS (ED25519_SIGN_RAW)** | アプリ内 ENV、Vault | GCP 既導入、HSM 同等、署名のみ KMS API 経由で秘密鍵が露出しない |
| 公開台帳 | **Solana Mainnet** | Polygon PoS, Base, Cardano 自前運用 | 手数料最安（~$0.00025/tx）、契約不要（Memo Program）、Ed25519 ネイティブ、TS SDK 成熟 |
| アンカリング戦略 | **Merkle Batch（時間 or 件数閾値）** | 1 VC = 1 tx | 桁違いに安く、運用上問題ない（1 時間粒度の証跡で十分） |
| アンカ用ウォレット | **GCP KMS 管理の Solana keypair** | 環境変数の秘密鍵 | プライベートキー流出リスク排除、KMS API で署名 |

### 3.3 採用ライブラリ（npm）

| 用途 | パッケージ | 備考 |
|---|---|---|
| VC JWT 発行・検証 | `did-jwt-vc` ＋ `did-jwt` | W3C 準拠、アクティブメンテ |
| DID Resolver | `did-resolver` ＋ `web-did-resolver` ＋ `key-did-resolver` | did:web / did:key 両対応 |
| 鍵生成 (Ed25519) | `@noble/ed25519` | 監査済、依存ゼロ |
| Solana SDK | `@solana/web3.js` | 公式 |
| Merkle 木 | `@openzeppelin/merkle-tree` | OZ 製、proof 検証ロジックが標準的 |
| GCP KMS 署名 | `@google-cloud/kms` | 既導入想定 |

---

## 4. データモデル変更

### 4.1 Prisma スキーマ差分

`src/infrastructure/prisma/schema.prisma` の既存 2 テーブルに最小限のカラム追加。**破壊的変更なし**。

```prisma
model DidIssuanceRequest {
  // 既存カラム維持

  // 追加:
  didMethod    DidMethod  @default(IDENTUS) @map("did_method")
  // 既存レコードはそのまま IDENTUS、新規生成は INTERNAL。
}

enum DidMethod {
  IDENTUS    // 既発行レコードの後方互換用
  INTERNAL   // did:key 自前発行
  @@map("DIDMethod")
}

model VcIssuanceRequest {
  // 既存カラム維持

  // 追加:
  vcFormat        VcFormat  @default(IDENTUS_JWT) @map("vc_format")
  vcJwt           String?   @map("vc_jwt")       // 自前発行 VC の本体（JWT 文字列）
  anchorBatchId   String?   @map("anchor_batch_id")
  anchorTxSignature String? @map("anchor_tx_signature") // Solana tx 署名（Base58）
  anchorMerkleProof Json?   @map("anchor_merkle_proof")  // [hash, hash, ...] 検証用パス

  anchorBatch     VcAnchorBatch? @relation(fields: [anchorBatchId], references: [id])
  @@index([anchorBatchId])
}

enum VcFormat {
  IDENTUS_JWT   // 既存
  INTERNAL_JWT  // 自前
  @@map("VCFormat")
}

// 新規テーブル: バッチ単位のアンカ記録
model VcAnchorBatch {
  id              String   @id @default(cuid())
  merkleRoot      String   @map("merkle_root")        // hex 0x...
  leafCount       Int      @map("leaf_count")
  txSignature     String?  @map("tx_signature")        // Solana 署名 Base58
  slot            BigInt?                              // Solana slot
  blockTime       DateTime? @map("block_time")
  status          AnchorStatus @default(PENDING)
  errorMessage    String?  @map("error_message")
  retryCount      Int      @default(0) @map("retry_count")

  createdAt       DateTime @default(now())
  publishedAt     DateTime? @map("published_at")
  confirmedAt     DateTime? @map("confirmed_at")

  vcRequests      VcIssuanceRequest[]

  @@index([status])
  @@map("t_vc_anchor_batches")
}

enum AnchorStatus {
  PENDING       // バッチ作成済み・未送信
  SUBMITTED     // tx 送信済み・未確定
  CONFIRMED     // ブロック確定
  FAILED
}
```

### 4.2 マイグレーション戦略
- 全カラムは **NULL 許容** または **デフォルト値あり** で追加 → 既存データに影響なし
- 既発行の IDENTUS レコードは `didMethod=IDENTUS` / `vcFormat=IDENTUS_JWT` のまま据え置き
- マイグレーション名: `add_internal_did_vc_and_anchor_batches`

---

## 5. レイヤごとの実装計画

DDD/Clean Architecture の規約（`CLAUDE.md` 準拠）を厳守。

### 5.1 Infrastructure 層

#### 5.1.1 新規: `src/infrastructure/libs/crypto/kmsSigner.ts`
- GCP KMS の非対称鍵で Ed25519 署名する薄いラッパ
- I/F: `sign(payload: Uint8Array): Promise<Uint8Array>`、`getIssuerJwk(): Promise<JsonWebKey>`
- 鍵バージョン: `projects/{p}/locations/{l}/keyRings/{r}/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/1`

#### 5.1.2 新規: `src/infrastructure/libs/did/issuerDid.ts`
- `did:web:civicship.jp` の DID Document を返すロジック
- 鍵 JWK は KMS の公開鍵から動的生成 → メモリキャッシュ（TTL 1h）
- ローテーション: 旧鍵は `verificationMethod` に残し、新鍵を `assertionMethod` の先頭に置く

#### 5.1.3 新規: `src/infrastructure/libs/did/userDidGenerator.ts`
- `did:key:z6Mk...` を Ed25519 鍵から生成
- ユーザー単位で生成し、**秘密鍵は破棄**（platform-issued; ユーザー署名は不要、subject identifier として使うだけ）
- 既存仕様と同じく「DID 値だけ DB に保存」する運用

#### 5.1.4 新規: `src/infrastructure/libs/anchor/solanaAnchorClient.ts`
- I/F:
  - `submitMemoTx(memo: string): Promise<{ signature: string; slot: bigint; blockTime: Date }>`
  - `getTxStatus(signature: string): Promise<"confirmed" | "finalized" | "failed">`
- Memo Program ID: `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`
- メモ形式: `civicship/v1/{batchId}/{merkleRootHex}`（566 byte 上限の十分内）
- フィー支払い鍵: KMS 管理。 `signTransaction` を KMS 署名で代替する関数を実装
- RPC: Helius / QuickNode 等の有料 RPC を推奨（無料公開 RPC はレート制限厳しい）

#### 5.1.5 既存削除（または deprecated 化）
- `src/infrastructure/libs/did.ts` (`DIDVCServerClient`): IDENTUS 廃止後にディレクトリごと削除
- `src/infrastructure/libs/point-verify/client.ts`: 後述「公開検証 API 内製化」で置換

### 5.2 Application 層

#### 5.2.1 改修: `account/identity/didIssuanceRequest/service.ts`
- 新メソッド `createInternalDID(ctx, userId, tx)`:
  1. `userDidGenerator.generate()` で `did:key:...` 生成
  2. `DidIssuanceRequest` レコードを `status=COMPLETED, didMethod=INTERNAL, didValue=did:key:...` で**同期作成**
  3. ジョブ ID・トークンリフレッシュ・ポーリングは不要
- 既存 `requestDID` / `syncDIDIssuance` メソッドは feature flag が OFF の経路用に残置 → 完全移行後に削除
- `Identity.authToken` のリフレッシュロジック: 内製経路では不要、IDENTUS 経路用に隔離

#### 5.2.2 改修: `experience/evaluation/vcIssuanceRequest/service.ts`
- 新メソッド `issueInternalVC(ctx, evaluationId, tx)`:
  1. `VCIssuanceRequestConverter.toVCIssuanceRequestInput(evaluation)` で claims 取得（**既存ロジックそのまま流用**）
  2. `did-jwt-vc` で VC ペイロード組み立て:
     - `issuer = did:web:civicship.jp`
     - `subject = user.didValue (did:key:...)`
     - `issuanceDate = now`
     - `credentialSubject = claims`
  3. `kmsSigner.sign()` で JWT 署名 → `vcJwt` 文字列
  4. `VcIssuanceRequest` レコードを `status=COMPLETED, vcFormat=INTERNAL_JWT, vcJwt=...` で同期作成
  5. `merkleAnchorService.enqueue(vcId, sha256(vcJwt))` でアンカ待機列に投入
  6. 通知送信は既存ロジック流用

#### 5.2.3 新規: `application/domain/audit/anchor/`（新ドメイン）
- `service.ts: MerkleAnchorService`
  - `enqueue(refId, leafHash)`: `VcAnchorBatch` の最新 PENDING に追記、なければ新規作成
  - `closeAndPublishBatch(batchId)`: Merkle tree 構築 → `solanaAnchorClient.submitMemoTx` → 結果保存
  - `confirmBatch(batchId)`: tx ステータス確認 → `CONFIRMED` 化
  - `verifyVCInclusion(vcId)`: 公開検証用。VC ハッシュ＋proof から root 復元、`VcAnchorBatch` の root と一致確認、`confirmedAt` 確認
- `data/repository.ts: AnchorBatchRepository`: Prisma クエリ
- `presenter.ts`: GraphQL 用の整形

CLAUDE.md「ServiceはGraphQL型を返さない」「UseCaseで `tx` 管理」を遵守。

### 5.3 Presentation 層（バッチ）

#### 5.3.1 既存バッチの整理
- `src/presentation/batch/requestDIDVC/`: feature flag OFF時のみ動作（IDENTUS 経路）。完全移行後に削除
- `src/presentation/batch/syncDIDVC/`: 同上

#### 5.3.2 新規バッチ: `src/presentation/batch/anchorVC/`
- `index.ts`: cron エントリ
- `closeBatches.ts`: 直近 1h 経過 or 1000 件超の PENDING バッチを `closeAndPublishBatch` 呼び出し
- `confirmBatches.ts`: SUBMITTED 状態を `confirmBatch` でフォローアップ
- 起動: `PROCESS_TYPE=batch BATCH_PROCESS_NAME=anchor-vc`

#### 5.3.3 新規 GraphQL: アンカ情報の公開
- `Query.vcAnchorProof(vcIssuanceRequestId: ID!): VcAnchorProof`
  - 戻り値: `{ vcJwt, merkleRoot, merkleProof[], txSignature, slot, blockTime, solanaExplorerUrl }`
- 第三者検証用: VC 受領者がこの API のみで「Solana 上に確かにアンカされている」を確認できる
- 認可: 評価対象ユーザー本人 or `internal` のみ（`presentation/graphql/rule.ts` に追加）

### 5.4 検証ライブラリ（公開用）
オプション。 `civicship-vc-verify` という独立 npm パッケージ or `docs/handbook/VC_VERIFY.md` のスクリプトサンプルとして提供:
1. VC JWT を `did-jwt-vc` で署名検証（issuer DID Document を `did:web` 解決）
2. `vcAnchorProof` を取得
3. ローカルで `keccak256(vcJwt)` から Merkle proof を辿り root 復元
4. Solana RPC で tx を読み、メモから root を抽出して照合

これで**第三者が civicship-api を信頼せずに VC の真正性を独立検証可能**となる（公開台帳要件の本質）。

---

## 6. `/point/verify` の置換

### 6.1 現状の用途調査が先
`src/infrastructure/libs/point-verify/client.ts` の実利用箇所を特定し、以下のいずれかに振り分ける:

- **(a) 評価VCの公開証跡として呼ばれている** → 5.3.3 の `Query.vcAnchorProof` で代替（推奨）
- **(b) 別の Cardano tx 検証** → 当該 tx も Solana に二重アンカリングして同等の検証を提供。または用途自体を見直し

### 6.2 一時的な互換レイヤ
完全移行までの過渡期、`PointVerifyClient` インタフェースを維持しつつ、内部で「Cardano なら IDENTUS、Solana なら自前」を分岐する Adapter を `src/infrastructure/libs/point-verify/adapter.ts` に置く。フィーチャーフラグ駆動。

---

## 7. コスト試算

### 7.1 Solana 手数料（Mainnet）
- 基本料金: 5,000 lamports/署名 = 約 **$0.001/tx**（SOL=$200 換算）
- 1 時間に 1 バッチ × 24 × 30 = **720 tx/月** = **$0.72/月**
- バッチあたりの VC 数に上限なし（Merkle tree のサイズで決まる）→ 1 万件/月でも 1,000 万件/月でも料金は同じ

### 7.2 GCP KMS
- 非対称鍵 1 個: $0.06/月
- 署名 API: $0.03/10,000 ops
- VC 1 万件/月 + アンカ 720 件/月 ≒ **$0.10/月**

### 7.3 Solana RPC（Helius / QuickNode）
- 無料枠: 100k req/日 — このユースケースには十分
- 有料枠が必要になっても **$50/月以下** で十分

### 7.4 Solana ガス用 SOL の補充
- 720 tx/月 × $0.001 = $0.72/月。バッファ含めて **$5 を年 1 回チャージ** する程度

### 7.5 合計
| 項目 | 月額 |
|---|---|
| Solana tx 手数料 | ~$1 |
| GCP KMS | ~$0.10 |
| RPC（無料枠運用） | $0 |
| **合計** | **~$1〜$2/月** |

→ 成功基準「$10/月以下」を大幅にクリア。

---

## 8. セキュリティ設計

### 8.1 鍵管理
- **Issuer 署名鍵（VC 用 Ed25519）**: GCP KMS、エクスポート不可、`roles/cloudkms.signer` を Cloud Run のサービスアカウントにのみ付与
- **アンカ用 Solana 鍵**: GCP KMS、同等の制御。独立鍵にして責務分離
- **鍵ローテーション手順**:
  1. KMS で新バージョン作成
  2. `did:web` Document に新鍵を `assertionMethod` 先頭で追記
  3. 1 週間並行運用
  4. 旧鍵を `verificationMethod` だけに残す（過去 VC の検証は引き続き可能）
  5. 完全廃止は最低 1 年後

### 8.2 入力検証
- claims に含まれる `evaluator.name` `participant.name` `opportunity.title` は**ユーザー入力由来**
  - JWT 化前に長さ制限・制御文字除去をかける（既存 service の入口で）
  - JSON エンコード経由するため XSS 等は本質的に発生しないが、容量肥大対策は必須

### 8.3 アンカ tx の改ざん耐性
- Merkle root は KMS で署名された tx に同梱されるため、submit 前に書き換え不可
- 万一 root 書き換えがあっても、leaf プルーフが整合しないため検証段階で検知できる

### 8.4 リプレイ・順序保証
- 各 VC の `id` は `cuid()` でユニーク
- VC ペイロードに `jti`（JWT ID = `vcIssuanceRequest.id`）を入れる → 第三者が重複検出可能
- バッチ内 leaf 順序は `createdAt ASC` 固定 → root 再現可能

### 8.5 失敗モード
| 障害 | 影響 | 対処 |
|---|---|---|
| KMS 一時障害 | VC 発行不可 | リトライ＋アラート。VC 発行は数時間遅延しても致命的ではない |
| Solana RPC 障害 | アンカ遅延（VC 自体は発行済み） | バッチを `PENDING` で滞留 → 復旧後に publish |
| Solana ネットワーク全体停止（過去事例あり） | アンカ遅延 | 同上。バッチ滞留期間にアラート閾値（24h） |
| Merkle proof 不整合 | バグ | 単体テスト＋ステージング常時検証で検知 |

---

## 9. 段階的リリース（4 フェーズ）

### Phase 0: PoC（1 週間）
- KMS 鍵作成、`did:web` Document 配信、`did-jwt-vc` で VC を 1 件手動発行
- Solana Devnet で Memo tx を手動 submit、tx 確認＆メモ抽出スクリプト作成
- 第三者検証スクリプトの動作確認

### Phase 1: 内製発行（フラグ OFF 配置、2 週間）
- スキーマ追加 → マイグレーション
- Service 改修＋新規ドメイン `audit/anchor` 追加
- バッチ `anchorVC` 追加（Devnet 接続）
- フィーチャーフラグ `INTERNAL_DID_VC_ENABLED=false` でデプロイ → リリース対象なし

### Phase 2: 影 dual-write（1 週間）
- 新規 Evaluation の VC を**両方の経路で発行**（IDENTUS は従来通り、内製は影 DB 書込みのみ）
- 7 日間データ突合: claims 同一性、署名検証成功率、アンカ確定率
- 異常なければ Phase 3 へ

### Phase 3: 内製カットオーバー（1 日）
- フラグ `INTERNAL_DID_VC_ENABLED=true` ON
- 新規 DID/VC は内製経路のみ
- IDENTUS API 呼び出しはコード上残るが実行されない
- 監視: VC 発行成功率、アンカ確定率、KMS エラー率

### Phase 4: IDENTUS 撤去（次スプリント以降）
- 1 ヶ月安定稼働確認
- `requestDIDVC` / `syncDIDVC` バッチ、`DIDVCServerClient`、`PointVerifyClient` を削除
- env 変数 `IDENTUS_API_URL` / `IDENTUS_API_KEY` / `IDENTUS_API_SALT` を削除
- ドキュメント `INFRASTRUCTURE.md` / `ARCHITECTURE.md` 更新

### ロールバック
- Phase 3 でも、フラグを `false` に戻すだけで IDENTUS 経路に即時退避可能（コードは Phase 4 まで残す）

---

## 10. テスト戦略

### 10.1 ユニット
- `kmsSigner`: KMS をモック、署名ペイロード一致を確認
- `userDidGenerator`: 既知の鍵から既知の `did:key` が生成されることを RFC ベクトルで検証
- `MerkleAnchorService`: leaf 集合 → root 計算、proof 検証

### 10.2 統合
- VC 発行〜DB 保存〜JWT 検証〜DID Document 解決の E2E
- Solana Devnet 実環境で submit→confirm→verifyVCInclusion の全周

### 10.3 互換性
- 既存 `vcIssuanceRequests` GraphQL クエリの返却形が変わっていないことを既存テストで確認
- 既存 IDENTUS データのレコードが `vcFormat=IDENTUS_JWT` で読めること

---

## 11. オープンクエスチョン

| # | 内容 | 担当 |
|---|---|---|
| Q1 | `/point/verify` の現実の呼び出し元と使用頻度（フロントエンドからか、内部監査か） | 要調査 |
| Q2 | Issuer DID のドメインは `civicship.jp` でよいか、`api.civicship.jp` か別か | プロダクト判断 |
| Q3 | 既発行 IDENTUS DID/VC の表示用 UI を残すか、内製 DID/VC のみ表示にするか | プロダクト判断 |
| Q4 | アンカリング粒度（1h vs 24h vs 件数閾値）— 要件次第で大きく変わる | 要相談 |
| Q5 | Solana の過去ネットワーク停止リスクを踏まえ、バックアップ台帳（例: Polygon に二重アンカ）を持つか | リスク選好次第 |

---

## 12. 受け入れチェックリスト

- [ ] Phase 0 PoC で第三者検証スクリプトが pass する
- [ ] Phase 1 デプロイ後、フラグ ON でも既存テストが全 pass
- [ ] Phase 2 dual-write で 1 週間データ突合 100% 一致
- [ ] Phase 3 後、新規 VC 発行が IDENTUS API を呼ばない（メトリクスで確認）
- [ ] Phase 4 完了時、月次運用コストが $10 を下回る
- [ ] `docs/handbook/INFRASTRUCTURE.md` / `ARCHITECTURE.md` の IDENTUS 記述が削除される
- [ ] `docs/handbook/` に「VC 公開検証手順」セクションが追加される
