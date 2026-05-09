# DID/VC 内製化 設計書

外部委託している Hyperledger IDENTUS（旧 Atala PRISM）から脱却し、DID/VC 発行を自前で署名・公開台帳アンカリングする設計案。

- 作成日: 2026-05-08
- 対象ブランチ: `claude/did-vc-internalization-review-eptzS`
- 前提: 「ブロックチェーン上の公開台帳は事業要件として必須」
- 想定公開台帳: **Solana Mainnet**（Memo Program 利用、契約デプロイ不要）— ただし §3.4 で他候補と比較し、事業側確認を経て確定する
- **本検討の発端**: 2026-04-19 に発生した IDENTUS Cloud Agent VM のディスク枯渇障害（Cardano フルノードのディスク管理が破綻、`/etc/passwd` すら書込不能）。Cardano 自前運用は同じ構造的リスクを抱える点を §3.4 で評価する

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
                          │   ├─ ComputeBudget priority fee  │
                          │   ├─ submit Solana memo tx ──────┼─▶ Solana Mainnet (Memo Program)
                          │   │   memo: civicship/v1/<id>/<root>
                          │   ├─ poll until FINALIZED        │   ※ confirmed では不可逆性なし
                          │   └─ on drop: bump fee & resend  │
                          │   persist {batchId, merkleRoot,  │
                          │     txSignatures[], leafIndex}   │   ※ proof は保存せず検証時に再生成
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
| Merkle proof 保存 | **保存せず検証時に再生成（leafIndex のみ DB）** | 各 VC に proof JSON を保存 | DB ストレージが O(log N × VC 件数) → O(VC 件数) へ削減、検証は稀 |
| アンカ完了条件 | **Solana `finalized` のみ** | `confirmed` を完了とみなす | フォーク巻き戻しによる事後的無効化を防ぎ、不可逆性を担保 |
| 優先手数料 | **`ComputeBudgetProgram` で動的設定（再送時 2 倍）** | 基本料金 5,000 lamports のみ | メインネット混雑時の取り込み確実性、ドロップ復旧 |
| ユーザー DID 鍵 | **KMS マスター + HKDF で決定論的派生（再生成可能）** | 生成後に秘密鍵を破棄 | 将来のエクスポート/自己署名拡張に対応、DB に秘密鍵を保存しない |
| アンカ用ウォレット | **GCP KMS 管理の Solana keypair** | 環境変数の秘密鍵 | プライベートキー流出リスク排除、KMS API で署名 |
| バッチ enqueue 競合制御 | **PostgreSQL アドバイザリロック + leafIndex CAS** | アプリレベル mutex のみ | マルチインスタンス環境でも leaf 順序・root の一貫性を保証 |

### 3.3 採用ライブラリ（npm）

| 用途 | パッケージ | 備考 |
|---|---|---|
| VC JWT 発行・検証 | `did-jwt-vc` ＋ `did-jwt` | W3C 準拠、アクティブメンテ |
| DID Resolver | `did-resolver` ＋ `web-did-resolver` ＋ `key-did-resolver` | did:web / did:key 両対応 |
| 鍵生成 (Ed25519) | `@noble/ed25519` | 監査済、依存ゼロ |
| Solana SDK | `@solana/web3.js` | 公式 |
| Merkle 木 | `@openzeppelin/merkle-tree` | OZ 製、proof 検証ロジックが標準的 |
| GCP KMS 署名 | `@google-cloud/kms` | 既導入想定 |

### 3.4 公開台帳の選定（**要事業判断**）

#### 3.4.1 検討の発端となった障害

2026-04-19 22:01 頃、`identus-cloud-agent-vm`（prod、Cardano フルノード+Cloud Agent 同居）でディスク枯渇が発生し、以下の連鎖障害が起きた:

- civicship-api → IDENTUS `/point/verify` への呼び出しが **18 連続 404**
- VM 内で `/etc/passwd` / `/etc/group` すらロック取得不可（`No space left on device`）
- Cloud Agent プロセスの起動・ログ出力・チェーン書き込みが全停止

これは「外部 SaaS 障害」というより**自前ホスト Cardano フルノードの構造的脆弱性**が表面化したもの。Cardano フルノードは累積 TB 級のチェーンデータを保持するため、ディスク管理を継続的に行わない限り同じ事象が再発する。

**本設計書を起こした最大の動機は、この運用負債そのものを切り離すこと** にある。よってチェーン選定にあたっては「自前フルノード運用が必要か」が最重要の評価軸となる。

#### 3.4.2 候補比較

| 候補 | tx 手数料 | 自前ノード | TS SDK | Ed25519 整合 | 障害クラス | 月次コスト概算 |
|---|---|---|---|---|---|---|
| **Solana Mainnet** ⭐ | ~$0.001/tx | 不要（Helius等 RPC 委譲） | 成熟 | ◎ ネイティブ | RPC 障害のみ | **~$1〜2** |
| **Cardano (Blockfrost)** ⭐ | ~$0.07-0.10/tx (0.17 ADA) | 不要（Blockfrost に委譲） | 成熟 (`@blockfrost/blockfrost-js`) | ○ Ed25519 | RPC 障害のみ | **$0（STARTER 無料枠）＋ ADA 手数料 ~$2-3** |
| Polygon PoS | ~$0.01/tx | 不要（Alchemy等 RPC 委譲） | 成熟 | △ secp256k1 経由 | RPC 障害のみ | ~$5 |
| Base / Arbitrum | ~$0.001/tx | 不要 | 成熟 | △ secp256k1 経由 | RPC 障害のみ | ~$2 |
| Cardano 自前フルノード | ~$0.07-0.10/tx | **必要**（ディスク負債継続） | 弱め | ○ Ed25519 | **今回の障害が再発** | $20+ ＋ VM 運用工数 |
| IDENTUS 継続 | ベンダ依存 | （実態は Cardano 自前ノード同居） | 既存 | ○ | **今回の障害そのもの** | 現行費用 |

> Cardano の月次コストは「1 日 1 anchor、メタデータ ~256B」想定。Blockfrost STARTER は 50,000 req/日まで無料・1 プロジェクト・100MB IPFS で本用途には十分。自前フルノードは選択肢から外して良い。

#### 3.4.3 選定の判断軸

判断は次の 1 点に絞られる:

> **「Cardano にアンカしている」ことが外向きの約束（行政・パートナー・補助金申請・プレスリリース等）になっているか？**

- **YES の場合**:
  - 第一候補は **Cardano (Blockfrost SaaS 経由)**。フルノードは不要で運用負債は Solana と同等
  - 自前フルノード運用は今回の障害クラスを引きずるため**選択肢から除外**
- **NO の場合**:
  - 第一候補は **Solana Mainnet**（tx 手数料が Cardano の 1/70〜1/100、Ed25519 ネイティブ整合）
  - 「Cardano から Solana へ」の移行は実装詳細の話であり、外部に説明する必要なし

#### 3.4.4 暫定推奨（要再確認）

YES / NO どちらでも **運用負債ゼロ＋月コスト 1 桁 USD** が成立する状況になった。事業確認が取れるまで両案併記:

- **Cardano 約束あり** → Cardano (Blockfrost STARTER) ＋ ADA 手数料 月 ~$3
- **Cardano 約束なし** → Solana Mainnet ＋ Helius/QuickNode 月 ~$1-2

いずれにせよ「自前 Cardano フルノードを引き継ぐ」案は不採用。

#### 3.4.5 Cardano 採用時の実装スケッチ

採用時は以下のライブラリで構成:

| 用途 | パッケージ | 役割 |
|---|---|---|
| Blockfrost API | `@blockfrost/blockfrost-js` | tx submit / metadata 取得 / UTXO 取得 / プロトコルパラメータ取得 |
| tx 構築 | `@emurgo/cardano-serialization-lib-nodejs` | UTXO 選択、metadata 添付、署名 |

主要メソッド（master ソース確認済み）:

```ts
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";

const api = new BlockFrostAPI({ projectId: process.env.BLOCKFROST_PROJECT_ID });

// 1. プロトコルパラメータ取得（手数料計算に必要）
const params = await api.epochsLatestParameters();

// 2. メタデータ構築（CIP-20 互換ラベル 674）
const generalMeta = CSL.GeneralTransactionMetadata.new();
generalMeta.insert(
  CSL.BigNum.from_str("674"),
  CSL.encode_json_str_to_metadatum(
    JSON.stringify({ root: merkleRootHex, ts: Date.now() }),
    CSL.MetadataJsonSchema.NoConversions,
  ),
);
const auxData = CSL.AuxiliaryData.new();
auxData.set_metadata(generalMeta);

// 3. tx 構築 → 署名 → submit
const txBuilder = CSL.TransactionBuilder.new(/* params から組成 */);
txBuilder.set_auxiliary_data(auxData);
// ...inputs/outputs/change を組み build
const signedTx = signTransaction(txBuilder.build(), signKey);
const txHash = await api.txSubmit(signedTx.to_bytes());

// 4. 第三者検証: ラベル 674 の全 anchor tx を取得
const allAnchors = await api.metadataTxsLabel(674);
```

メタデータ上限 16 KB / tx（Cardano プロトコル制約）— Merkle root 32B には十分。

**確定前のアクション（事業側）**:
- [ ] 「Cardano にアンカしている」が約束に組み込まれているか確認（pitch deck / 行政提出物 / 補助金 / パートナー契約）
- [ ] 確認結果を §11 オープンクエスチョン Q0 に追記し、本セクションの「⭐」のいずれかを確定する

#### 3.4.6 バッチ経済性（Q4 アンカリング粒度の判断材料）

**重要な性質**: Merkle batching では tx メタデータに載るのは root 32 バイトのみ。**N 件まとめても tx サイズと手数料は一定**。よって課金ドライバーは「Transaction 件数」ではなく「**バッチ頻度**」になる。

##### 既存 5000 件の backfill 想定（Cardano @ 0.17 ADA/tx, $0.50/ADA 想定）

| 戦略 | tx 数 | コスト | 検証粒度 |
|---|---|---|---|
| **素朴**: 1 Transaction = 1 Cardano tx | 5,000 | **~$425** | tx 単位（過剰） |
| 全件を 1 本にまとめる | 1 | **~$0.08** | 「2026-04 以前の全 Transaction」 |
| 月別バケット（12 ヶ月分） | 12 | ~$1 | 月単位 |
| 日別バケット（365 日分） | 365 | ~$30 | 日単位 |

→ backfill 方針はコストと検証粒度のトレードオフで決める。最小なら 1 tx で済む。

##### 運用開始後の月次見積もり

| バッチ頻度 | 月 tx 数 | ADA 手数料 | Blockfrost API 消費 |
|---|---|---|---|
| **日次（24h）** | ~30 | **~$2-3** | ~300 call/月（無料枠の 0.02%） |
| 6h | ~120 | ~$10 | ~1,200 call/月 |
| 1h | ~720 | ~$60 | ~7,200 call/月 |

→ Blockfrost STARTER 無料枠（50,000 req/**日**）はどの頻度でも余裕。ADA 手数料が線形に効く。

##### 推奨

- **バックフィル**: 5000 件全部を 1 tx に集約（**~$0.08**）。「IDENTUS 時代以前の全レコードを内製アンカに移行」というスナップショットとして妥当
- **継続運用**: 日次バッチで開始（**月 ~$3**）。粒度を細かくしたくなったら頻度を上げるだけで済む。粒度はあとから細かくはできても粗くは戻せないため、**まず粗く始める**のが合理的

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
  anchorLeafIndex Int?      @map("anchor_leaf_index")    // バッチ内のリーフ位置（プルーフは検証時に再生成）

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
  merkleRoot      String?  @map("merkle_root")        // hex 0x...（CLOSED 化時に確定）
  leafCount       Int      @default(0) @map("leaf_count")
  // tx 再送に備えて履歴を配列で保持。最新が最後尾
  txSignatures    String[] @default([]) @map("tx_signatures")
  slot            BigInt?                              // 確定スロット
  blockTime       DateTime? @map("block_time")
  status          AnchorStatus @default(OPEN)
  errorMessage    String?  @map("error_message")
  retryCount      Int      @default(0) @map("retry_count")
  priorityFeeMicroLamports BigInt? @map("priority_fee_micro_lamports") // 直近の指定値
  // 楽観的ロック用バージョン（リーフ追加時に CAS で増分）
  lockVersion     Int      @default(0) @map("lock_version")

  createdAt       DateTime @default(now())
  closedAt        DateTime? @map("closed_at")        // OPEN→PENDING 遷移時刻
  publishedAt     DateTime? @map("published_at")
  finalizedAt     DateTime? @map("finalized_at")     // finalized 確認時刻

  vcRequests      VcIssuanceRequest[]

  @@index([status])
  @@map("t_vc_anchor_batches")
}

enum AnchorStatus {
  OPEN          // 受付中（リーフ追加可能）
  PENDING       // クローズ済み・root 確定・未送信
  SUBMITTED     // tx 送信済み・finalized 待機
  CONFIRMED     // finalized 確定（不可逆）
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
- ユーザー単位で生成し、subject identifier として利用（platform-issued; 当面ユーザー署名は不要）
- **将来の拡張性確保のため、秘密鍵は破棄せず復元可能な形で扱う**:
  - **採用案: 決定論的派生（HKDF）**
    - マスターシードを GCP KMS で `MAC_SIGN`（HMAC-SHA256）として保管（`projects/.../cryptoKeys/civicship-user-did-master`）
    - ユーザーごとの秘密鍵: `Ed25519.fromSeed(HKDF(masterMacOf(userId), info="civicship/v1/user-did"))`
    - 必要時に決定論的に再生成可能、DB へは秘密鍵を一切保存しない
    - マスター鍵が KMS でローテーションされる場合は鍵バージョン (`derivationKeyVersion`) を `Identity` に記録し、過去ユーザー DID を一意に再現できるようにする
  - 副次効果: 将来「ユーザーがウォレットへエクスポート」「ユーザー自身が VC に副署名」等のユースケースに対応する場合、決定論的に同じ鍵を再生成して提示できる
  - 反対に、純粋な「破棄」設計は将来の拡張パスを完全に封じるため採用しない
- DB には引き続き **DID 値（公開鍵由来）のみ** を保存（既存仕様と整合）。`Identity` テーブルに `userDidDerivationKeyVersion: Int?` カラムを追加

#### 5.1.4 新規: `src/infrastructure/libs/anchor/solanaAnchorClient.ts`
- I/F:
  - `submitMemoTx(memo, opts: { priorityFeeMicroLamports: bigint }): Promise<{ signature, recentBlockhash, lastValidBlockHeight, slot }>`
  - `getTxFinality(signature): Promise<"finalized" | "confirmed" | "processed" | "dropped" | "failed">`
  - `resubmitMemoTx(memo, prevSignatures: string[], opts): Promise<...>` — ブロックハッシュ更新＋優先手数料引き上げ
- Memo Program ID: `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`
- メモ形式: `civicship/v1/{batchId}/{merkleRootHex}`（566 byte 上限の十分内）
- フィー支払い鍵: KMS 管理。 `signTransaction` を KMS 署名で代替する関数を実装
- RPC: Helius / QuickNode 等の有料 RPC を推奨（無料公開 RPC はレート制限厳しい）

##### 優先手数料（Priority Fees）
Solana メインネットでは混雑時に基本手数料（5,000 lamports）のみではトランザクションが取り込まれないため、`ComputeBudgetProgram` を必ず併用する:

```typescript
// 各 anchor tx に必ず追加する 2 つの instruction
ComputeBudgetProgram.setComputeUnitLimit({ units: 50_000 })       // memo は軽量、上限を絞る
ComputeBudgetProgram.setComputeUnitPrice({ microLamports: fee })  // 動的決定
```

優先手数料 `fee` の動的決定方針:
- ベースライン: `getRecentPrioritizationFees()` の中央値 × 1.2
- 上限: 50,000 micro-lamports（= 0.00025 SOL/CU上乗せ、運用上の安全弁）
- 再送時は前回値の **2 倍**（最大 5 回まで指数増）
- 直近値・上限・再送倍率は env で調整可能 (`SOLANA_ANCHOR_PRIORITY_FEE_MAX` 等)

##### 再送・ドロップ対策
Solana の `recentBlockhash` は ~150 slot（~60 秒）で失効するため、`SUBMITTED` 状態の tx が `finalized` に到達しないケースに備えて:

1. `getSignatureStatuses` で `processed` / `confirmed` / `finalized` / null を判別
2. `null` かつ `lastValidBlockHeight < currentBlockHeight` → **ドロップ確定**
3. ドロップなら新しい `recentBlockhash` を取得し、優先手数料を 2 倍にして再送
4. 再送ごとに `VcAnchorBatch.txSignatures` 配列に追記（履歴を残す）
5. 5 回再送しても `finalized` 不達 → `FAILED` 化＋アラート（運用者が手動介入）
6. `finalized` 到達 → `CONFIRMED` 化（後述 8.3 の根拠：`confirmed` ではフォーク巻き戻しの可能性が残るため）

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
  - `enqueue(refId, leafHash, tx)`: 現在 `OPEN` のバッチに `leafIndex` を採番して追記、なければ新規作成。**競合制御は下記参照**
  - `closeBatch(batchId)`: `OPEN → PENDING` 遷移＋ Merkle tree 構築＋ root 確定（リーフ追加を打ち切る）
  - `publishBatch(batchId)`: `solanaAnchorClient.submitMemoTx` → `SUBMITTED` 化＋ tx 署名保存
  - `confirmBatch(batchId)`: `getTxFinality` で **`finalized`** を確認できた時のみ `CONFIRMED`。`confirmed`/`processed` では遷移しない（フォーク巻き戻しリスク回避）
  - `resubmitBatch(batchId)`: ドロップ検知時に手数料を引き上げて再送
  - `verifyVCInclusion(vcId)`: 公開検証用。バッチ内全 leaf を再走査して proof を**動的生成**し、Solana 上の root と一致確認、`finalizedAt` の存在確認
- `data/repository.ts: AnchorBatchRepository`: Prisma クエリ
- `presenter.ts`: GraphQL 用の整形

CLAUDE.md「ServiceはGraphQL型を返さない」「UseCaseで `tx` 管理」を遵守。

##### `enqueue` の競合制御
複数 VC が同時に発行されても安全に同一バッチへ集約できるよう、以下を組み合わせる:

1. **PostgreSQL アドバイザリロック**: `pg_advisory_xact_lock(hashtext('vc-anchor-open-batch'))` をトランザクション開始時に取得
   - 「OPEN バッチを探す or 作成する」セクションを完全直列化
   - ロックは tx 終了で自動解放、ロック対象は単一定数キーなのでデッドロック不能
2. **OPEN バッチは常に高々 1 件**: `WHERE status = 'OPEN' LIMIT 1 FOR UPDATE` でロック取得後、見つからなければ新規 INSERT
3. **leafIndex の連番採番**: 同一 tx 内で `leafCount` を取得 → `leafIndex = leafCount` を VC に書き込み → `leafCount += 1` に CAS（`lockVersion` を併用）
4. **クローズ時の競合**: `closeBatch` は `UPDATE ... WHERE status='OPEN' AND id=? RETURNING *` で原子的に PENDING へ。クローズ後の enqueue 試行は新規バッチを作る
5. **代替案（高負荷時）**: VC 1 件 = leaf テーブル 1 行とし、`closeBatch` ジョブが「未バッチの leaf を集めて 1 バッチに束ねる」純 pull 型に切り替え可能（拡張パスとして留置）

これにより同時 VC 発行が秒間数百件規模になっても、leafIndex の重複・root 不整合は発生しない。

### 5.3 Presentation 層（バッチ）

#### 5.3.1 既存バッチの整理
- `src/presentation/batch/requestDIDVC/`: feature flag OFF時のみ動作（IDENTUS 経路）。完全移行後に削除
- `src/presentation/batch/syncDIDVC/`: 同上

#### 5.3.2 新規バッチ: `src/presentation/batch/anchorVC/`
- `index.ts`: cron エントリ
- `closeBatches.ts`: OPEN バッチを「直近 1h 経過 or 1000 件超」で打ち切り（`closeBatch` → `publishBatch`）
- `confirmBatches.ts`: SUBMITTED 状態を `getTxFinality` で確認:
  - `finalized` → `confirmBatch` で `CONFIRMED` 化
  - `null` かつ `lastValidBlockHeight` 経過 → `resubmitBatch`（ブロックハッシュ更新＋優先手数料 2 倍）
  - 5 回再送後も未確定 → `FAILED` ＋ アラート
- 起動: `PROCESS_TYPE=batch BATCH_PROCESS_NAME=anchor-vc`
- 推奨実行間隔: `closeBatches` 1h、`confirmBatches` 1min（`finalized` までの典型的所要 ~13s に対し十分）

#### 5.3.3 新規 GraphQL: アンカ情報の公開
- `Query.vcAnchorProof(vcIssuanceRequestId: ID!): VcAnchorProof`
  - 戻り値: `{ vcJwt, merkleRoot, merkleProof[], leafIndex, txSignature, slot, blockTime, finality, solanaExplorerUrl }`
  - **proof は DB から取り出すのではなく、リクエスト時にバッチの全 leaf から動的構築**
    - DB ストレージ消費が VC 件数に対し線形でなく定数（`leafIndex` のみ）
    - 検証要求は本番でも稀（外部監査 / ユーザー個別の証明書ダウンロード時）→ オンデマンド計算で実用上問題なし
    - バッチ内 leaf 数 N に対し proof 生成は O(N)、署名検証は O(log N)。N=1000 でも数 ms
- 第三者検証用: VC 受領者がこの API のみで「Solana 上に確かにアンカされている」を確認できる
- `finality` フィールドで `confirmed`/`finalized` を識別可能にし、検証側が `finalized` のみを信頼するよう促す
- 認可: 評価対象ユーザー本人 or `internal` のみ（`presentation/graphql/rule.ts` に追加）

### 5.4 検証ライブラリ（公開用）
オプション。 `civicship-vc-verify` という独立 npm パッケージ or `docs/handbook/VC_VERIFY.md` のスクリプトサンプルとして提供:
1. VC JWT を `did-jwt-vc` で署名検証（issuer DID Document を `did:web` 解決）
2. `vcAnchorProof` を取得（API は **その場で proof を再生成**して返す。DB には proof を保存しない）
3. ローカルで `keccak256(vcJwt)` から Merkle proof を辿り root 復元
4. Solana RPC で tx の **finality が `finalized`** であることを確認し、メモから root を抽出して照合

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

### 8.3 Solana finality と `CONFIRMED` 遷移条件
- Solana の commitment レベルは `processed` < `confirmed` < `finalized`
  - `confirmed`: スーパーマジョリティ vote 観測（数秒）。**フォークによる巻き戻しの可能性が残る**
  - `finalized`: 31 ブロック以上の確認（~13 秒）。実質不可逆
- **本設計では `CONFIRMED` ステータス遷移条件を `finalized` のみ** とする
  - `confirmed` 段階では `SUBMITTED` のまま据え置き
  - 公開検証 API も `finality` 値を返し、消費側に判断させる（推奨検証は `finalized`）
- 公開台帳要件は「改ざん不能性」が本質であり、`confirmed` で完了扱いにすると**後から無効化される可能性**を抱えるため不可

### 8.4 アンカ tx の改ざん耐性
- Merkle root は KMS で署名された tx に同梱されるため、submit 前に書き換え不可
- 万一 root 書き換えがあっても、leaf プルーフが整合しないため検証段階で検知できる

### 8.5 リプレイ・順序保証
- 各 VC の `id` は `cuid()` でユニーク
- VC ペイロードに `jti`（JWT ID = `vcIssuanceRequest.id`）を入れる → 第三者が重複検出可能
- バッチ内 leaf 順序は **`leafIndex` ASC** 固定（`createdAt` ではなく enqueue 時に採番した連番）→ root 再現可能、同時 enqueue でも順序が一意

### 8.6 失敗モード
| 障害 | 影響 | 対処 |
|---|---|---|
| KMS 一時障害 | VC 発行不可 | リトライ＋アラート。VC 発行は数時間遅延しても致命的ではない |
| Solana RPC 障害 | アンカ遅延（VC 自体は発行済み） | バッチを `PENDING` / `SUBMITTED` で滞留 → 復旧後に publish/再送 |
| Solana tx ドロップ（混雑時） | `SUBMITTED` で `lastValidBlockHeight` 失効 | 5.1.4 の再送ロジック（優先手数料 2 倍 → 5 回まで） |
| Solana 軽度フォーク | `confirmed` 後に巻き戻し | `finalized` を待つ設計のため `CONFIRMED` には影響なし |
| Solana ネットワーク全体停止（過去事例あり） | アンカ遅延 | バッチ滞留期間にアラート閾値（24h）。Q5 のバックアップ台帳を採用するならここで切り替え |
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

| # | 内容 | 担当 | 優先度 |
|---|---|---|---|
| **Q0** | **「Cardano にアンカしている」が外向きの約束（pitch deck / 行政提出物 / 補助金 / パートナー契約）に組み込まれているか** — §3.4 のチェーン選定が確定しないと実装に進めない | 事業判断 | **最優先** |
| Q1 | `/point/verify` の現実の呼び出し元と使用頻度（フロントエンドからか、内部監査か） | 要調査 | 高 |
| Q2 | Issuer DID のドメインは `civicship.jp` でよいか、`api.civicship.jp` か別か | プロダクト判断 | 中 |
| Q3 | 既発行 IDENTUS DID/VC の表示用 UI を残すか、内製 DID/VC のみ表示にするか | プロダクト判断 | 中 |
| Q4 | アンカリング粒度（1h vs 24h vs 件数閾値）— 要件次第で大きく変わる | 要相談 | 中 |
| Q5 | Q0 が NO で Solana を選ぶ場合、Solana の過去ネットワーク停止リスクを踏まえ、バックアップ台帳（例: Polygon に二重アンカ）を持つか | リスク選好次第 | 低 |

---

## 12. 受け入れチェックリスト

- [ ] Phase 0 PoC で第三者検証スクリプトが pass する
- [ ] Phase 1 デプロイ後、フラグ ON でも既存テストが全 pass
- [ ] Phase 2 dual-write で 1 週間データ突合 100% 一致
- [ ] Phase 3 後、新規 VC 発行が IDENTUS API を呼ばない（メトリクスで確認）
- [ ] Phase 4 完了時、月次運用コストが $10 を下回る
- [ ] `docs/handbook/INFRASTRUCTURE.md` / `ARCHITECTURE.md` の IDENTUS 記述が削除される
- [ ] `docs/handbook/` に「VC 公開検証手順」セクションが追加される
