# DID/VC 内製化 設計書

外部委託している Hyperledger IDENTUS（旧 Atala PRISM、IOG 開発）から脱却し、DID/VC 発行を**自前で署名・Cardano に直接アンカリング**する設計案。

- 作成日: 2026-05-08（最終更新: 2026-05-09）
- 対象ブランチ: `claude/did-vc-internalization-review-eptzS`
- 公開台帳: **Cardano Mainnet**（助成金条件で確定）
- チェーン書込: **Blockfrost SaaS**（自前 Cardano フルノード不要）
- DID method: **`did:web`**（Issuer）＋ チェーン anchor（`did:prism` 同等の機能性を保つ）
- VC: **W3C VC JWT** ＋ GCP KMS 署名

---

## 0. なぜ内製化するか（本検討の発端）

2026-04-19 22:01 頃、prod 環境の `identus-cloud-agent-vm`（Cardano フルノード ＋ IDENTUS Cloud Agent 同居）で**ディスク枯渇障害**が発生:

```
gpasswd: /etc/group.XXXXXXX: No space left on device
useradd: /etc/passwd.XXXXXXX: No space left on device
gpasswd: cannot lock /etc/group; try again later.
```

連鎖障害:
- civicship-api → IDENTUS `/point/verify` で **18 連続 404**
- VM レベルで `/etc/passwd` すらロック取得不可 → Cloud Agent プロセスの起動・ログ・チェーン書込が全停止
- Transaction の Merkle 検証機能が全停止

**根本原因**: `did:prism` を選んだことで IDENTUS Cloud Agent ＋ Cardano フルノードを civicship 側で運用する構造になっており、ディスク管理という運用負債を抱え続けていた。

**本設計の目的**: この構造的負債そのものを切り離し、**技術的負債を抱えない形**で同等以上の機能を実現する。

---

## 1. 目的とゴール

### 1.1 内製化の対象（2 系統）

| 系統 | 現状 | 目標 |
|---|---|---|
| **(A) Transaction の Merkle anchoring** | civicship-api が `MerkleCommit`/`MerkleProof` をローカル計算 → IDENTUS Cloud Agent が Cardano に submit | civicship-api 自身が Blockfrost 経由で submit。週次バッチ |
| **(B) DID/VC の発行＋ DID 操作履歴の chain 記録** | IDENTUS API 経由で `did:prism` 発行 ＋ PRISM 内部で履歴管理 | `did:web` ＋ DID 操作（create/update/deactivate）を Cardano に記録 |

両系統は**同じ Blockfrost-based Cardano 書込基盤**を共有する。

### 1.2 非ゴール

- 既発行の `did:prism:...` レコードを書き換えること（旧行は履歴として残し、新規 `DidIssuanceRequest` 行を `INTERNAL` で追加することで上書き表示）
- 既存 `t_merkle_commits` / `t_merkle_proofs` への新規書き込み・スキーマ拡張（**死蔵テーブル扱い**、新規 anchor は別テーブル）
- ユーザーへのウォレット配布・自己管理 DID（self-sovereign）への切替（platform-issued を維持）
- 革新的な VC データモデル変更（既存 `EvaluationCredential` 構造を流用）

### 1.3 成功基準

1. `/point/verify` が外部 HTTP 呼び出しゼロでローカル DB 参照のみで応答
2. 新規 DID/VC が IDENTUS API を一切呼ばずに発行される
3. 任意の第三者が **Cardano explorer + HTTPS GET** だけで DID/VC の存在・内容を独立検証できる
4. DID の鍵ローテ・deactivate が **Cardano 上に追跡可能な履歴**として記録される（`did:prism` 同等の機能性）
5. 月額運用コストが **$5/月以下**
6. 既存 GraphQL スキーマ（`DidIssuanceRequest` / `VcIssuanceRequest`）への破壊的変更ゼロ
7. `/point/verify` のレスポンス形（`{ txId, status, transactionHash, rootHash, label }`）は維持

---

## 2. 現状アーキテクチャ

### 2.1 外部依存

| 依存先 | 用途 | 実装位置 |
|---|---|---|
| IDENTUS API: `POST /did/job/create-and-publish` | DID 作成（`did:prism:...`） | `src/infrastructure/libs/did.ts:7` |
| IDENTUS API: `GET /did/job/{jobId}` | 非同期ジョブの状態ポーリング | 同上 |
| IDENTUS API: `POST /vc/connectionless/job/issue-to-holder` | VC 発行（JWT 形式） | 同上 |
| IDENTUS API: `GET /vc/connectionless/job/{jobId}` | VC 発行ジョブの状態ポーリング | 同上 |
| IDENTUS API: `POST /point/verify` | Transaction Merkle 検証 | `src/infrastructure/libs/point-verify/client.ts:54` |

**全て IDENTUS Cloud Agent VM** が処理する。

### 2.2 主要コード資産

- バッチ:
  - `src/presentation/batch/requestDIDVC/`（DID/VC 発行要求）
  - `src/presentation/batch/syncDIDVC/`（PROCESSING の同期・タイムアウト判定）
- ドメインサービス:
  - `src/application/domain/account/identity/didIssuanceRequest/service.ts`
  - `src/application/domain/experience/evaluation/vcIssuanceRequest/service.ts`
- DB: `DidIssuanceRequest` / `VcIssuanceRequest`（`PENDING → PROCESSING → COMPLETED/FAILED`）
- DB: `MerkleCommit` / `MerkleProof`（ローカル計算結果、chainTxHash カラム**なし**）
- GraphQL: `Query.vcIssuanceRequests` / `Query.vcIssuanceRequest`、`DidIssuanceRequest` 型

### 2.3 構造的問題

- **`did:prism` を選んだ結果、IDENTUS Cloud Agent + Cardano フルノードを抱える** → 運用負債
- **`MerkleCommit` に chainTxHash カラムがない** → civicship-api 側は「自分が作った root が Cardano のどの tx に乗ったか」を知らない（IDENTUS に問い合わせる必要あり）
- **IDENTUS Cloud Agent VM の単一障害点** → 今回のディスク枯渇で全機能停止
- **チェーン同期の状態を civicship-api が制御できない** → 障害時のリカバリも IDENTUS 側に依存

---

## 3. 提案アーキテクチャ

### 3.1 全体像

```
[DID 発行]
  generateUserKeypair (Ed25519) → did:web 文字列生成
  DID Document JSON 構築
  DidIssuanceRequest INSERT (didMethod=INTERNAL, didValue=did:web:...)
  UserDidAnchor INSERT (operation=CREATE, status=PENDING)
  ↓
[VC 発行]
  Subject DID = 上記 did:web:...
  Issuer DID = did:web:civicship.app
  KMS で Ed25519 署名 → JWT 生成
  VcIssuanceRequest INSERT (vcFormat=INTERNAL_JWT, vcJwt=...)
  ↓
[週次バッチ（毎週日曜 02:00 JST）]
  ┌─ Transaction の Merkle root 計算 → TransactionAnchor INSERT
  └─ DID 操作集合 → UserDidAnchor 行を集約
  ↓
  Blockfrost API (HTTPS) で Cardano に tx submit
  metadata label 1985 に root + DID 操作リストを格納
  ↓
  Cardano チェーン
  ↓
  status: PENDING → SUBMITTED → CONFIRMED
  
[DID 解決（外部 verifier）]
  https://civicship.app/users/u_xyz/did.json (HTTPS GET)
  → DID Document に proof フィールド埋込（anchor tx hash + root + Merkle proof）
  → 任意の Cardano explorer で proof.anchorTxHash の metadata を確認
  → root と Merkle proof が整合 → 検証完了
  
[civicship.app 消失時の緊急時 fallback]
  Cardano explorer で metadata 1985 を時系列で取得
  → DID 操作履歴を再構築
  → DID Document を再構築可能
```

### 3.2 核心判断

| 判断 | 採用 | 理由 |
|---|---|---|
| 公開台帳 | **Cardano Mainnet** | 助成金条件で固定 |
| チェーン書込 | **Blockfrost SaaS** | フルノード不要 → 今回の障害クラスを構造ごと排除 |
| DID method | **`did:web:civicship.app`** | W3C 標準・Universal Resolver 対応・PRISM 非依存 |
| User DID | **`did:web:civicship.app:users:u_xyz`** | 全ユーザーが同じ method、`did:web` resolver で解決可能 |
| DID 操作の chain 記録 | **civicship 専用 metadata label 1985 に直接書込** | `did:prism` 同等の操作履歴・鍵ローテ・deactivate を維持 |
| Transaction anchor | **Merkle root のみ chain 上に**（leaf 集合は DB 内） | 件数 N に対し tx 数は一定 |
| バッチ頻度 | **週次** | 月 ~$0.50 のコスト・粒度はあとで細かくできる |
| VC 形式 | **W3C VC JWT** | 既存と互換、KMS 署名 |
| 鍵管理 | **GCP KMS Ed25519**（Issuer） ＋ **アプリ生成 Ed25519**（User） | 既存 GCP に統合 |
| 旧テーブル | `t_merkle_commits` / `t_merkle_proofs` は**死蔵**（新規書込なし） | 完全な世代交代 |

### 3.3 `did:prism` の機能性を別トラストモデルで再現する hybrid 設計

> 注: 「`did:prism` と同等」という表現は厳密ではない。`did:prism` は **resolver が直接 chain を見る** 設計、本設計は **HTTPS が一次解決・chain anchor が補助証拠** という異なるトラストモデルを採用する。**機能の網羅性は同等以上、トラストモデルは異なる**。

本設計のポジショニング:

> **平常時は `did:web` の単純さ、有事は chain anchor で監査可能** という hybrid 設計

各機能の比較:

| 機能 | `did:prism` | 本設計 (`did:web` + Cardano anchor) |
|---|---|---|
| DID 操作履歴の chain 記録 | resolver が chain から直接取得 | UserDidAnchor → 週次バッチで Cardano metadata 1985 に CREATE/UPDATE/DEACTIVATE 記録 |
| 鍵ローテーション追跡 | chain 上の DID Document 履歴 | UPDATE 操作が `prev` で前 tx hash 参照 → hash chain 形成 |
| DID deactivation | chain 上で deactivate event | DEACTIVATE op を chain に記録、resolver は HTTPS doc または chain history で判定 |
| ベンダ消失時の resolve | chain＋PRISM resolver があれば可能 | civicship.app 消失時、Cardano metadata 1985 から op 履歴を時系列スキャン → DID Document 再構築可能 |
| Cardano 上の改ざん耐性 | 同等 | 同等（同じチェーンに直接書く） |
| 平常時の resolve 速度 | chain クエリ必須 | HTTPS GET 1 回（速い） |
| 必要なクライアント | PRISM SDK / IDENTUS resolver | 標準 did:web resolver（あらゆるツール） |

**重要な前提**: 本設計の「chain 単独 resolve」は**専用ツール**を要する（CSL でメタデータ展開＋ CBOR デコード＋ hash chain 検証）。一般 verifier は HTTPS で resolve、chain anchor は audit / 改ざん検知用途。

#### トラストモデルの違い

| 想定 | `did:prism` | 本設計 |
|---|---|---|
| civicship が DID Document を改竄 | 困難（chain に直接書込のため） | 可能（HTTPS なので）、ただし **chain anchor の hash と不整合** で検出可能 |
| `civicship.app` の DNS / TLS 乗っ取り | 該当しない（HTTPS 不要） | あり得る、ただし **chain anchor で検出可能**（§8.6 参照） |
| IOG / Atala プロジェクトの停止 | resolver メンテ停止 → 困難 | 影響なし |
| Cardano チェーンの停止 | resolve 不可 | HTTPS 解決のみ可能、chain audit は不可 |

→ 各失敗モードで完全な耐性を持つわけではないが、**現実的な脅威分布の幅広いカバレッジ**を持つのがこの hybrid 設計の特徴。

### 3.4 採用ライブラリ（npm）

| 用途 | パッケージ | 備考 |
|---|---|---|
| VC JWT 発行・検証 | `did-jwt-vc` ＋ `did-jwt` | W3C 準拠、アクティブメンテ |
| DID Resolver | `did-resolver` ＋ `web-did-resolver` | did:web 解決、ライブラリ依存最小 |
| 鍵生成 (Ed25519) | `@noble/ed25519` | 監査済、依存ゼロ |
| Blockfrost API | `@blockfrost/blockfrost-js` | 公式 |
| Cardano tx 構築 | `@emurgo/cardano-serialization-lib-nodejs` | Cardano 標準 |
| Merkle 木 | `@openzeppelin/merkle-tree` | OZ 製、proof 検証ロジックが標準的 |
| GCP KMS 署名 | `@google-cloud/kms` | 既導入想定 |
| CBOR エンコード | `cbor-x` | DID Document の chain 格納用 |

---

## 4. データモデル

### 4.1 新規 / 拡張スキーマ

```prisma
// =========================================================
// 既存テーブルの拡張（後方互換）
// =========================================================

model DidIssuanceRequest {
  // 既存カラム維持

  // 追加:
  didMethod    DidMethod  @default(IDENTUS) @map("did_method")
}

enum DidMethod {
  IDENTUS    // 既発行レコードの後方互換用
  INTERNAL   // did:web 自前発行
  @@map("DIDMethod")
}

model VcIssuanceRequest {
  // 既存カラム維持

  // 追加:
  vcFormat        VcFormat  @default(IDENTUS_JWT) @map("vc_format")
  vcJwt           String?   @map("vc_jwt")           // 自前発行 VC の本体（JWT 文字列）
  anchorBatchId   String?   @map("anchor_batch_id")   // chain anchor との紐付け
  anchorLeafIndex Int?      @map("anchor_leaf_index") // バッチ内のリーフ位置（proof は検証時に再生成）

  @@index([anchorBatchId])
}

enum VcFormat {
  IDENTUS_JWT   // 既存
  INTERNAL_JWT  // 自前
  @@map("VCFormat")
}

// =========================================================
// 新規テーブル
// =========================================================

// (A) Transaction Merkle anchoring 用
//
// 旧 t_merkle_commits / t_merkle_proofs は死蔵。FK も依存も持たない。
// proof は問い合わせ時に leafIds から動的生成する（MerkleProof 相当のテーブル不要）
model TransactionAnchor {
  id            String       @id @default(cuid())

  periodStart   DateTime     @map("period_start")
  periodEnd     DateTime     @map("period_end")

  rootHash      String       @map("root_hash")          // 32-byte Blake2b-256 (Cardano-native), hex 64 chars (no 0x prefix)
  leafIds       String[]     @map("leaf_ids")            // Transaction.id を正規順序（cuid ASC）で保持
  leafCount     Int          @map("leaf_count")

  network       ChainNetwork
  metadataLabel Int          @default(1985) @map("metadata_label")  // civicship 専用 label。674 (CIP-20 messages) は wallet が "メッセージ" として表示してしまうため避ける
  chainTxHash   String?      @map("chain_tx_hash")
  blockHeight   Int?         @map("block_height")

  status        AnchorStatus @default(PENDING)
  submittedAt   DateTime?    @map("submitted_at")
  confirmedAt   DateTime?    @map("confirmed_at")

  attemptCount  Int          @default(0) @map("attempt_count")
  lastError     String?      @map("last_error") @db.Text

  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime?    @updatedAt @map("updated_at")

  @@index([status])
  @@index([periodEnd])
  @@index([leafIds], type: Gin)        // /point/verify の `leaf_ids && $1::text[]` 検索を高速化（必須）
  @@map("t_transaction_anchors")
}

// (B) DID 操作の chain 記録（did:prism 同等の機能性を担保）
//
// 各 DID の各操作（create/update/deactivate）を 1 行で表現。
// 同じ tx に複数行が乗る（バッチ submit のため）。
// previousAnchorId で hash chain を形成し、版履歴を追跡可能。
model UserDidAnchor {
  id              String       @id @default(cuid())

  did             String                                          // "did:web:civicship.app:users:u_xyz"
  operation       DidOperation                                    // CREATE / UPDATE / DEACTIVATE

  documentHash    String       @map("document_hash")              // 該当バージョン DID Document の hash (32B hex)
  documentCbor    Bytes?       @map("document_cbor")              // CBOR 圧縮した DID Document（chain 単独 resolve 用）

  previousAnchorId String?     @map("previous_anchor_id")         // 前バージョンへのリンク（hash chain）
  previousAnchor   UserDidAnchor? @relation("DidVersionChain", fields: [previousAnchorId], references: [id])
  nextAnchors      UserDidAnchor[] @relation("DidVersionChain")

  // chain 書込状態
  network         ChainNetwork
  metadataLabel   Int          @default(1985) @map("metadata_label")  // civicship 専用（674 回避、§5.1.6 参照）
  chainTxHash     String?      @map("chain_tx_hash")              // CONFIRMED 後に確定
  chainOpIndex    Int?         @map("chain_op_index")             // 同一 tx 内の何番目の op か

  status          AnchorStatus @default(PENDING)
  submittedAt     DateTime?    @map("submitted_at")
  confirmedAt     DateTime?    @map("confirmed_at")

  // ユーザー紐付け
  userId          String       @map("user_id")
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime?    @updatedAt @map("updated_at")

  @@index([did, createdAt])
  @@index([userId])
  @@index([status])
  @@map("t_user_did_anchors")
}

enum DidOperation {
  CREATE
  UPDATE       // 鍵ローテ等
  DEACTIVATE
}

// =========================================================
// 共有 enum
// =========================================================

enum AnchorStatus {
  PENDING       // 計算済み・未送信
  SUBMITTED     // tx 送信済み・confirm 待機
  CONFIRMED     // 確定（不可逆）
  FAILED
}

enum ChainNetwork {
  CARDANO_MAINNET
  CARDANO_PREPROD
  @@map("ChainNetwork")
}
```

### 4.2 旧テーブルの扱い

| テーブル | 新方式での扱い |
|---|---|
| `t_merkle_commits` | **死蔵**。新規 INSERT 無し。SELECT も新方式からは行わない。IDENTUS 時代のレガシーとして保持 |
| `t_merkle_proofs` | 同上。`MerkleCommit` への FK 経由で残るのみ |
| `Transaction.merkleProofs` リレーション | アプリ層からは新方式では参照しない（リレーション定義は当面残す） |
| `t_transaction_anchors` | **新方式の正本**。バックフィルで既存 5000 件分を 1 row に集約 |
| `t_user_did_anchors` | DID 操作履歴の正本。既存 `did:prism` ユーザーは backfill で `INTERNAL` 行を新規発行 |

### 4.3 マイグレーション戦略

- 全カラムは **NULL 許容** または **デフォルト値あり** で追加 → 既存データに影響なし
- 既発行の IDENTUS レコードは `didMethod=IDENTUS` / `vcFormat=IDENTUS_JWT` のまま据え置き
- 旧 `t_merkle_commits` / `t_merkle_proofs` は **読み書きとも一切触らない**（DROP もしない、後日 audit が済んだら別マイグレーションで削除可）
- マイグレーション名: `add_internal_did_vc_and_anchors`

---

## 5. レイヤごとの実装

DDD/Clean Architecture 規約（`CLAUDE.md` 準拠）厳守。

### 5.1 Infrastructure 層

#### 5.1.1 新規: `src/infrastructure/libs/crypto/kmsSigner.ts`
- GCP KMS の Ed25519 鍵で署名する薄いラッパ
- I/F: `sign(payload: Uint8Array): Promise<Uint8Array>`、`getIssuerPublicKey(): Promise<Uint8Array>`
- 鍵バージョン: `projects/{p}/locations/{l}/keyRings/{r}/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/N`

#### 5.1.2 新規: `src/infrastructure/libs/did/issuerDid.ts`
- `did:web:civicship.app` の DID Document を返す
- KMS 公開鍵から JWK を動的生成 → メモリキャッシュ（TTL 1h）
- 鍵ローテ時: 旧鍵を `verificationMethod` に残し、新鍵を `assertionMethod` の先頭に置く

#### 5.1.3 新規: `src/infrastructure/libs/did/userDidGenerator.ts`
- ユーザー鍵 (Ed25519) を生成 → `did:web:civicship.app:users:{userId}` 形式で返す
- DID Document を構築（id, verificationMethod, assertionMethod, authentication）
- 戻り値: `{ did, document, publicKey }`（**秘密鍵は生成直後に破棄**）
- **platform-issued モデルの前提**: civicship が VC の Issuer であり、ユーザーは Verifiable Presentation (VP) を提示する役割を持たない。よってユーザー側で秘密鍵を保持・使用する場面が存在しないため、**秘密鍵を生成・保持しない**設計とする
- 将来 VP 機能が必要になった場合は、ユーザーデバイス側で鍵生成 → 公開鍵のみサーバ送信、というフローに切り替える（§8.1 参照）

#### 5.1.4 新規: `src/infrastructure/libs/did/didDocumentResolver.ts`
- ユーザー DID から DID Document を生成（DB の最新 UserDidAnchor から）
- proof フィールドに最新 CONFIRMED な anchor 情報を埋め込み
- `/users/{userId}/did.json` から呼ばれる

#### 5.1.5 新規: `src/infrastructure/libs/blockfrost/client.ts`
- `@blockfrost/blockfrost-js` の DI 対応ラッパ
- 主要メソッド:
  - `getProtocolParams()` → `epochsLatestParameters()`
  - `getUtxos(address: string)` → `addressesUtxosAll`
  - `submitTx(cborHex: Uint8Array)` → `txSubmit`
  - `getTxMetadata(hash: string)` → `txsMetadata`
  - `awaitConfirmation(hash: string, timeoutMs: number)` → `txs` を polling
- リトライ・指数バックオフ内蔵

#### 5.1.6 新規: `src/infrastructure/libs/cardano/txBuilder.ts`

##### 概要
- `@emurgo/cardano-serialization-lib-nodejs` のラッパ
- `buildAnchorTx(input: { utxos, root, didOps, signKey, params }): SignedTx`

##### Cardano metadata の制約（重要）

Cardano transaction metadata には次の制約があり、設計はこれを考慮する必要がある:

| 制約 | 値 | 対応 |
|---|---|---|
| 1 transaction の metadata 全体サイズ | **16 KB** | バッチ件数で調整、超過時は分割 tx |
| **1 文字列要素の長さ** | **64 byte** | hex 32 byte (= 64 chars) は OK だが `0x` prefix 付き 66 chars は NG |
| バイト列要素の長さ | 64 byte | bytes 型を使う場合の制約 |
| ネスト深さ | 任意 | 配列 / map のネストは可 |

→ **長い文字列（64 byte 超）は配列に分割するか、bytes として CBOR 直接エンコードする**。Cardano Serialization Lib (CSL) には `TransactionMetadatum.new_bytes` / `new_text` があり、長すぎる場合はリスト化する API がある。

##### 採用する metadata label

**label = `1985`**（civicship 専用、後から CIP 提案する想定）

❌ label 674 は CIP-20 で **transaction messages/comments** 用に予約されており、Daedalus / Eternl 等の wallet が "メッセージ" として表示してしまう → DID anchor に使うとユーザーに混乱を招くため避ける。

##### メタデータ構造（label 1985 配下）

```jsonc
{
  "v": 1,                                // schema version
  "ts": 1746336034,                      // unix ts
  "tx": {
    // root は 32-byte Blake2b、hex 64 chars (0x prefix なし)
    "root": "4a7b3c8d9e2f1a0b5c6d7e8f9a0b1c2d3e4f506172839abcdef0123456789ab",
    "count": 5213
  },
  "ops": [
    {
      "k": "c",                          // "c" = create / "u" = update / "d" = deactivate
      "did": "did:web:civicship.app:users:u_xyz",
      // doc_hash も 64 chars （0x prefix なし）
      "h": "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678abcdef0123456789abcdef01",
      // CBOR-encoded DID Document を bytes として記録
      // CSL の TransactionMetadatum.new_bytes() で書込（64 byte 上限のため、長い場合は配列に分割）
      "doc": [
        "<bytes 0..63>",
        "<bytes 64..127>",
        "..."
      ],
      "prev": null
    },
    {
      "k": "u",
      "did": "did:web:civicship.app:users:u_abc",
      "h": "c3d4...",
      "doc": ["...", "..."],
      "prev": "<prev tx hash, 64 chars>"  // 64 chars (Cardano tx hash は 32 byte)
    },
    {
      "k": "d",
      "did": "did:web:civicship.app:users:u_def",
      "prev": "<prev tx hash, 64 chars>"
    }
  ]
}
```

##### サイズ見積（修正版）

| 要素 | サイズ |
|---|---|
| root（hex 64 chars） | 64 B |
| count + ts + v | ~30 B |
| 1 op (create/update + doc 込み) | ~600-800 B（doc サイズ次第） |
| 1 op (deactivate, doc なし) | ~150 B |
| **1 tx に乗る op 数** | **~15-20 op**（doc 込み）／ ~80 op（hash のみ） |

→ 5000 件 backfill のコストは §10 Phase 3、§9 で再計算（後述）。

##### CSL での実装パターン

```ts
import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";

function buildMetadata(root: Uint8Array, ops: DidOp[]): CSL.AuxiliaryData {
  const general = CSL.GeneralTransactionMetadata.new();
  const top = CSL.TransactionMetadatum.new_map(buildTopMap(root, ops));
  general.insert(CSL.BigNum.from_str("1985"), top);

  const aux = CSL.AuxiliaryData.new();
  aux.set_metadata(general);
  return aux;
}

function bytesAsChunkedList(b: Uint8Array): CSL.TransactionMetadatum {
  // 64-byte 制約のため、64 byte ごとに分割して list に格納
  if (b.length <= 64) return CSL.TransactionMetadatum.new_bytes(b);
  const list = CSL.MetadataList.new();
  for (let i = 0; i < b.length; i += 64) {
    list.add(CSL.TransactionMetadatum.new_bytes(b.subarray(i, Math.min(i + 64, b.length))));
  }
  return CSL.TransactionMetadatum.new_list(list);
}
```

#### 5.1.7 新規: `src/infrastructure/libs/merkle/merkleTreeBuilder.ts`

##### 概要
- `@openzeppelin/merkle-tree` ラッパ
- `buildRoot(leafIds: string[]): { root: Uint8Array; getProof(idx: number): Uint8Array[] }`

##### canonical leaf encoding 仕様（**厳密に固定**）

「正規順序」だけだと曖昧で、**1 bit でもエンコーディングが変わると proof が通らなくなる**。本設計では以下を**仕様として固定**:

```
1. leafIds は Transaction.id (cuid 文字列) を ASCII byte の昇順 (ORDER BY id ASC) で並べる
2. 各 leaf の hash = Blake2b-256( utf8_bytes(transaction.id) )
   ※ "0x" prefix なし、padding なし、トリミングなし
3. Merkle 木の内部ノード = Blake2b-256( left_node_bytes || right_node_bytes )
   ※ 32 byte の生 bytes を連結（base16 文字列にしない）
4. 葉が奇数の場合、最後の葉を複製して右子とする（OZ ライブラリ標準仕様）
```

##### hash 関数の選択: Blake2b-256

| 候補 | 採用 | 理由 |
|---|---|---|
| **Blake2b-256** | ✅ | Cardano-native（チェーン上の hash と整合）、CSL 標準 |
| keccak256 | ❌ | EVM 慣習、Cardano エコシステムでは異質 |
| SHA-256 | ❌ | 速度的に劣る、Cardano 用途では非標準 |

→ `@openzeppelin/merkle-tree` のデフォルトは keccak256 だが、本設計では Blake2b に差し替え（OZ ライブラリは hash function を注入可能）。

##### TypeScript 実装

```ts
import { blake2b } from "@noble/hashes/blake2b";
import { utf8ToBytes, concatBytes } from "@noble/hashes/utils";

export function canonicalLeafHash(transactionId: string): Uint8Array {
  return blake2b(utf8ToBytes(transactionId), { dkLen: 32 });
}

export function buildMerkleTree(leafIds: string[]): {
  root: Uint8Array;
  getProof: (idx: number) => Uint8Array[];
} {
  // leafIds は呼び出し側で ORDER BY id ASC 済み前提
  const leaves = leafIds.map(canonicalLeafHash);
  // ... OZ 互換の Merkle tree 構築 (Blake2b で hashPair)
}

function hashPair(a: Uint8Array, b: Uint8Array): Uint8Array {
  return blake2b(concatBytes(a, b), { dkLen: 32 });
}
```

##### 第三者検証用の仕様書

外部 verifier が proof を独立検証するために、上記のエンコーディングルールは `docs/specs/civicship-merkle-anchor-2026.md`（独自 cryptosuite spec、§12 Q6 参照）に記載し、GitHub で公開する。

### 5.2 Application 層

#### 5.2.1 ドメイン: `account/identity/didIssuanceRequest`

修正対象: `service.ts` / `usecase.ts`

```ts
// Before（IDENTUS）
async create(ctx, userId): Promise<DidIssuanceRequest> {
  const job = await identusClient.createDid(...);
  // ジョブ ID 保存、ポーリング待機
}

// After（INTERNAL）
async create(ctx, userId, tx?): Promise<DidIssuanceRequest> {
  // 秘密鍵は generate 内で破棄、戻り値には含まれない
  const { did, document, publicKey } = userDidGenerator.generate(userId);
  await this.repo.create(ctx, {
    userId,
    didMethod: "INTERNAL",
    didValue: did,
    status: "COMPLETED",
  }, tx);
  await this.userDidAnchorRepo.create(ctx, {
    did,
    operation: "CREATE",
    documentHash: hashDocument(document),
    documentCbor: encodeCbor(document),
    userId,
    network: "CARDANO_MAINNET",
    status: "PENDING",
  }, tx);
}
```

DID Document の HTTPS 配信は別ドメイン（`did/document/`）で実装。

#### 5.2.2 ドメイン: `experience/evaluation/vcIssuanceRequest`

修正対象: `service.ts`

```ts
async issueInternal(ctx, evaluationId, subjectDid, claims): Promise<VcIssuanceRequest> {
  const issuerDid = "did:web:civicship.app";
  const payload = buildVcPayload({ issuer: issuerDid, subject: subjectDid, claims });
  const jwt = await didJwt.createVerifiableCredentialJwt(payload, kmsSigner);
  return await this.repo.create(ctx, {
    vcFormat: "INTERNAL_JWT",
    vcJwt: jwt,
    status: "COMPLETED",
  });
}
```

VC 自体は anchor 待ちなしで COMPLETED とする。anchor は次回バッチで遡及。

#### 5.2.3 新規ドメイン: `anchor`

`src/application/domain/anchor/`

- `service.ts`:
  - `collectPendingTransactions(periodStart, periodEnd)` → 期間内の Transaction を集約 → 新 TransactionAnchor 作成
  - `collectPendingDidOps(beforeTime)` → status=PENDING の UserDidAnchor を集約
- `usecase.ts`:
  - `executeWeeklyBatch()` → 上記 2 つを集めて 1 つの Cardano tx として submit
- `repository.ts`:
  - `TransactionAnchor` / `UserDidAnchor` の Prisma クエリ

### 5.3 Presentation 層（バッチ）

#### 5.3.1 新規: `src/presentation/batch/anchorWeekly/`

```ts
// 毎週日曜 02:00 JST 起動
async function run(ctx) {
  const usecase = container.resolve(AnchorUseCase);
  await usecase.executeWeeklyBatch();
}
```

処理内容:
1. PENDING な TransactionAnchor を 1 件取得（事前に作成済み or その場で作成）
2. PENDING な UserDidAnchor 群を集約
3. Blockfrost で UTXO ＋ プロトコルパラメータ取得
4. Cardano tx を構築（Merkle root ＋ DID ops を metadata 1985 に格納）
5. KMS で Issuer 鍵に署名（注: Cardano 用の Issuer wallet は別鍵、tx 署名は wallet 鍵）
6. `txSubmit` 実行 → `chainTxHash` を取得
7. `TransactionAnchor.status = SUBMITTED`、各 `UserDidAnchor.chainTxHash = ...` 更新
8. Confirmation polling（最大 5 分）→ `CONFIRMED` 遷移
9. 失敗時はリトライ（attemptCount 増分）、3 回失敗で FAILED

#### 5.3.2 既存: `requestDIDVC` / `syncDIDVC`

- feature flag OFF 時のみ動作（IDENTUS 経路）
- 完全移行後に削除

### 5.4 公開 API（HTTPS エンドポイント）

#### 5.4.1 新規: `/.well-known/did.json`
- Issuer DID（`did:web:civicship.app`）の DID Document を配信
- 静的に近いが KMS 公開鍵を反映するので動的生成

#### 5.4.2 新規: `/users/:userId/did.json`
- ユーザーごとの DID Document
- 中身は最新 CONFIRMED な UserDidAnchor から構築
- `proof` フィールドに anchor 情報（chainTxHash, root, Merkle proof）を埋込

#### 5.4.3 新規: `/anchor/:txHash/verify` (Optional)
- 任意の verifier が civicship 経由で chain 検証する場合のヘルパ
- 内部で Blockfrost を叩いて metadata を返すのみ

---

## 6. `/point/verify` の内製化

### 6.1 既存実装の整理

`src/infrastructure/libs/point-verify/client.ts:54` の `verifyTransactions(txIds: string[])`:

- 入力: Transaction ID 配列
- 出力: `{ txId, status, transactionHash, rootHash, label }[]`
- 実体: Transaction の Merkle 検証専用（`MerkleCommit` ベース）。汎用 tx 検証ではない

呼び出し元: `src/application/domain/transaction/verification/service.ts`（`TransactionVerificationService`）のみ。

### 6.2 新実装: 完全に内部完結

外部 HTTP 呼び出しなし。`t_transaction_anchors` への SQL クエリのみ:

```ts
@injectable()
export class PointVerifyClient {
  constructor(@inject("PrismaClient") private prisma: PrismaClient) {}

  async verifyTransactions(txIds: string[]): Promise<VerifyResponse[]> {
    // PG の text[] 配列演算子 && (overlap) で、いずれかの txId を含む anchor を検索
    const anchors = await this.prisma.$queryRaw<TransactionAnchorRow[]>`
      SELECT id, root_hash, chain_tx_hash, metadata_label, status, leaf_ids
      FROM t_transaction_anchors
      WHERE leaf_ids && ${txIds}::text[]
    `;

    return txIds.map(txId => {
      const a = anchors.find(x => x.leaf_ids.includes(txId));
      if (!a) {
        return { txId, status: "not_verified", transactionHash: "", rootHash: "", label: "" };
      }
      return {
        txId,
        status: mapAnchorStatus(a.status),       // CONFIRMED→"verified", SUBMITTED→"pending", FAILED→"error"
        transactionHash: a.chain_tx_hash ?? "",
        rootHash: a.root_hash,
        label: a.metadata_label,
      };
    });
  }
}
```

レスポンス形は既存 `VerifyResponse` 型と完全互換（フロントエンド・他クライアントへの影響なし）。

### 6.3 環境変数の整理

- `IDENTUS_API_URL` の参照を本クライアントから削除
- DI 登録（`provider.ts`）で `PrismaClient` への差し替え
- `PointVerifyClient` の API 形は維持 → `TransactionVerificationService` も無変更

### 6.4 proof の動的生成

公開検証 API として「proof も返す」要求が出た場合は、`leafIds` から木を再構築:

```ts
async getProof(txId: string): Promise<{ root: string; siblings: string[]; chainTxHash: string }> {
  const anchor = await this.prisma.transactionAnchor.findFirst({
    where: { leafIds: { has: txId } },
  });
  if (!anchor || !anchor.chainTxHash) throw new Error("not anchored");

  const leaves = anchor.leafIds.map(canonicalLeafHash);
  const tree = StandardMerkleTree.of(leaves, ["bytes32"]);
  const idx = anchor.leafIds.indexOf(txId);
  return {
    root: tree.root,
    siblings: tree.getProof(idx),
    chainTxHash: anchor.chainTxHash,
  };
}
```

---

## 7. DID 操作のチェーン記録（`did:prism` 同等機能の詳細）

### 7.1 操作の種類とフロー

| 操作 | トリガー | UserDidAnchor.operation | metadata 内の `op` |
|---|---|---|---|
| 新規 DID 発行 | ユーザーオンボーディング | `CREATE` | `"create"` |
| 鍵ローテ | KMS 鍵更新時 / ユーザー操作 | `UPDATE` | `"update"` |
| 失効 | アカウント削除 / 不正検知 | `DEACTIVATE` | `"deactivate"` |

### 7.2 hash chain による履歴整合性

```
[CREATE]   prev: null                         tx: tx1
[UPDATE]   prev: tx1                          tx: tx2  ← tx1 を参照
[UPDATE]   prev: tx2                          tx: tx3  ← tx2 を参照
[DEACTIVATE] prev: tx3                        tx: tx4  ← tx3 を参照
```

各 tx の metadata に `prev` フィールドで前バージョンの `chainTxHash` を入れる。改ざんしようとすると hash chain が破綻するため、Cardano explorer のみで完全な履歴監査が可能。

### 7.3 chain 単独で DID Document を再構築する手順

仮に `civicship.app` が消失しても、以下の手順で DID Document を再構築可能:

```
1. 検証者は did:web:civicship.app:users:u_xyz の DID 文字列を持っている
2. Cardano explorer / Blockfrost で metadata label 1985 を時系列スキャン
3. did=...u_xyz の op を全件抽出
4. CREATE → UPDATE...→ DEACTIVATE の順に hash chain を辿る
5. 最新非 DEACTIVATE の op の doc_cbor_b64 を CBOR デコード
6. DID Document が復元される
```

これにより `did:prism` と**同等のオンチェーン耐性**が得られる。

### 7.4 metadata サイズの制約と運用

#### 通常運用

- Cardano metadata 上限: **16 KB / tx**、文字列要素は **64 byte / 要素**（§5.1.6 参照）
- 1 op あたりサイズ:
  - CREATE / UPDATE（doc 込み）: ~600-800 B
  - DEACTIVATE: ~150 B
- 1 tx に乗せられる op 数: **doc 込みで ~15-20 op、hash のみなら ~80 op**
- 週次バッチで超過する場合は複数 tx に分割（1 tx 追加 = +0.17 ADA = ~$0.07）

実運用想定（新規ユーザー想定 100 人/週）:
- 通常週: 2-3 tx/週（~$0.20-$0.30/週）
- 大規模イベント時のみ分割増

#### Backfill 時（§10 Phase 3 で実施）

5000 ユーザーの初期 backfill では **1 tx に集約は不可能**（metadata 制約のため）:

| 戦略 | tx 数 | コスト |
|---|---|---|
| **doc 込みで 17 op/tx** | 5000 ÷ 17 ≒ **295 tx** | ~50 ADA ≒ **~$25** |
| **hash のみで 80 op/tx**（doc 本体は HTTPS のみ） | 5000 ÷ 80 ≒ **63 tx** | ~11 ADA ≒ **~$5** |
| **doc 込み Transaction Merkle root と同梱、複数 tx に均等分散** | ~63-100 tx | ~$5-15 |

→ **採用案: doc hash のみを chain に書く軽量 backfill**（~$5）。doc 本体は HTTPS で配信、必要時のみ doc を chain に書く UPDATE op を発行。これにより backfill コストを抑えつつ、運用フェーズに入ってからの新規発行は doc 込み op を採用できる。

→ §9 のコスト試算は **backfill 月のみ別計上**（一回限り ~$5、その後は通常運用 ~$1/月）。

---

## 8. セキュリティ設計

### 8.1 鍵管理

#### 8.1.1 鍵の種類と保管

| 鍵 | 用途 | 保管場所 | ローテ |
|---|---|---|---|
| **Issuer VC 署名鍵**（Ed25519） | VC JWT 署名 | **GCP KMS**（鍵素材は KMS 外に出ない） | 年次（KMS のキーバージョンを切替） |
| **Cardano wallet 鍵** | tx 署名 | **GCP KMS**（HSM-backed key ring） | 半年に 1 回 |
| **User DID 公開鍵** | DID Document に掲載・第三者検証 | DB（公開情報のため暗号化不要） | UPDATE 操作で公開鍵を差し替え（旧鍵は履歴として UserDidAnchor に残存） |
| **User DID 秘密鍵** | （**保持しない**） | — | — |

#### 8.1.2 User DID 秘密鍵を保持しない設計（重要）

**platform-issued モデルの前提**:

- civicship は VC の **Issuer**（発行者）であり、ユーザーは VC の **Subject**（記載対象）
- ユーザーが Verifiable Presentation (VP) を提示する用途は現状存在しない
- → ユーザーが自身の秘密鍵で何かに署名する場面が**ない**

よって本設計では:

- `userDidGenerator` は鍵ペアを**生成直後に秘密鍵を破棄**し、公開鍵のみを返す
- DB / KMS / どこにも秘密鍵を保管しない
- DID Document の `verificationMethod` には公開鍵のみ掲載
- VC 発行時の署名は **Issuer 鍵**（KMS 内）で行うため、ユーザー秘密鍵は介在しない

**これにより排除されるリスク**:

- DB 漏洩によるユーザー鍵流出（鍵自体が存在しない）
- KMS 内の per-user 鍵の管理コスト（5000 ユーザー × 鍵 = KMS では現実的でない）
- ユーザー鍵の暗号化方式・鍵ローテの複雑化

#### 8.1.3 将来 VP 対応が必要になった場合

「ユーザーが自身の VC を別のサービスに提示し、署名で本人性を示す」要件が出た場合の移行パス:

1. ユーザーデバイス側で鍵ペア生成（ブラウザ Web Crypto API or モバイル Secure Enclave）
2. 公開鍵のみをサーバに送信、サーバは UserDidAnchor の UPDATE 操作で公開鍵を差し替え
3. 秘密鍵は**ユーザーデバイス内のみ**に保持（サーバには絶対に送らない）
4. VP 署名はクライアント側で行い、サーバは公開鍵で検証のみ

→ この移行は本設計の Phase 4 完了後の独立タスクとして扱う（本 PR のスコープ外）。

#### 8.1.4 Cardano wallet 鍵の HSM 保管と single-payment-key 設計

##### KMS 経由の tx 署名

- GCP KMS の Ed25519 鍵で `signRaw` を呼び出し → tx hash に対する署名を取得
- 秘密鍵素材は KMS の HSM 内から一切外に出ない
- アプリケーションコードは「署名要求」のみ送信、署名結果のみ受け取る

##### CIP-1852 HD wallet ではなく single-payment-key 設計を採用

通常の Cardano wallet は CIP-1852（BIP-32 ベースの階層的決定性鍵）で、master seed から複数アドレスを派生させる。これは KMS の `signRaw` API では実現できない（KMS は固定鍵に対する署名 API のみ提供）。

→ 本設計では **1 つの payment key = 1 つの civicship issuer wallet address**（single-payment-key）を採用:

| 項目 | CIP-1852 HD wallet | **本設計 (single-payment-key)** |
|---|---|---|
| アドレス数 | 多数（per-tx で変更可能） | 1 つに固定 |
| 鍵管理 | seed phrase | KMS の鍵バージョン |
| プライバシー | アドレスを変えて履歴を分離 | 全 tx が同じアドレスから発信 |
| 残高管理 | 複数 UTXO 分散 | 1 アドレスに集約 |

##### single-payment-key のトレードオフ

**メリット**:
- KMS で完結（seed phrase の保管・バックアップが不要）
- 監査人が「civicship issuer wallet」を 1 アドレスで追跡可能（透明性向上）

**デメリット**:
- プライバシーがゼロ（civicship が出した全 anchor tx が紐づいて見える）
  - → ただし civicship の anchor は **公開して構わない** 性質（DID 操作の改ざん検知が目的）なので問題なし
- アドレスローテ時の影響範囲（後述）

##### 鍵ローテ時のアドレス変更

KMS 鍵バージョンを更新すると Cardano アドレスも変わる。運用上の対応:

1. 旧アドレスから新アドレスに残 ADA を移送（手動 tx 1 回、~$0.10）
2. 旧アドレスは「歴史的な civicship issuer wallet」として保持（過去 anchor の改ざん検知用）
3. backfill 整合性: 過去 anchor は旧アドレスから出された事実が chain に残るので、ローテ後も検証可能

##### Issuer wallet ADA 残高管理

- 50 ADA を float として保持（200+ 週分）
- 残高が 10 ADA 切ったら Slack 通知 → 手動補充
- 補充頻度: 年に 1-2 回程度

### 8.2 入力検証

- DID 文字列フォーマット検証（regex）
- Merkle leaf として使う Transaction.id の存在確認
- 重複 anchor 防止（unique constraint on `chain_tx_hash`）

### 8.3 Cardano confirmation

- `txs/{hash}` を polling、block_height が取得できれば 1 confirmation
- 5 confirmation 経過で `CONFIRMED` 遷移（実用的な finality）
- 失敗時はリトライ、3 回失敗で `FAILED`

### 8.4 リプレイ・順序保証

- 同 DID への UPDATE は `previousAnchorId` を直前の CONFIRMED 行に固定
- 並行更新は楽観ロック（`updatedAt` バージョン比較）
- chain 上では `prev` フィールドで前 tx hash を参照 → 攻撃者が op を入れ替えると hash chain が破綻して検出

### 8.5 失敗モード

| 失敗 | 影響 | 対応 |
|---|---|---|
| Blockfrost API 障害 | submit 不可 | リトライ → 次回バッチに繰越 |
| Cardano 一時的混雑 | confirm 遅延 | confirmation 待機タイムアウト延長 |
| Issuer wallet ADA 残高不足 | submit エラー | Slack 通知＋手動補充 |
| KMS 障害 | VC 発行不可 | 既存と同等のリスク（GCP 全体障害級） |

### 8.6 DNS / TLS 乗っ取りに対する脅威モデル（did:web 固有）

#### 脅威

`did:web` は HTTPS で DID Document を解決するため、以下の攻撃面が存在する:

| 攻撃 | 結果 |
|---|---|
| 攻撃者が `civicship.app` の DNS を乗っ取り、自前サーバに向ける | 攻撃者が任意の DID Document を返す → 偽の公開鍵で署名された VC が「正規」として検証されかねない |
| TLS 証明書の不正発行（rogue CA） | 同上 |
| civicship 内部の HTTPS サーバ侵害 | civicship 自身が改竄可能 |

#### 緩和策

**第 1 線: HTTPS インフラ強化**
- DNSSEC を `civicship.app` に設定
- CAA レコードで証明書発行 CA を限定（Let's Encrypt のみ等）
- HSTS preload list 登録
- 証明書透過性ログ（CT log）の監視

**第 2 線: chain anchor を活用した検出**

これが本設計の重要な強み: **HTTPS で取得した DID Document の hash が、Cardano 上の anchor と一致するか**を verifier が検証可能。

```
1. verifier が https://civicship.app/users/u_xyz/did.json を取得 → DID Document A
2. DID Document A の hash を計算 → H_A
3. Cardano metadata 1985 から該当 DID の最新 op を取得 → H_chain
4. H_A == H_chain なら正規、不一致なら DNS / TLS 乗っ取りの可能性
```

**監査人 / セキュリティ意識の高い verifier** には「chain anchor との整合確認」を推奨する運用。一般 verifier は HTTPS のみで運用（速度優先）。

→ これは `did:prism` には存在しない緩和策（`did:prism` は HTTPS を使わないので、そもそも DNS 攻撃面がない代わりに resolver の中央集権性に依存）。


---

## 9. コスト試算

### 9.1 Blockfrost API
- 用途: 週次 anchor 1-2 tx + DID Document HTTPS 配信時の chain 検証
- API call 数: 月 ~50 call
- 無料 STARTER プラン: 50,000 req/日 → **$0/月**

### 9.2 Cardano tx 手数料
- 1 tx ≒ 0.17 ADA = ~$0.07-0.10
- 週次バッチ 4 tx/月 + 操作多い週で +1 tx/週 → 月 6-8 tx
- **月 ~$0.50**
- Issuer wallet ADA float: 50 ADA で 200+ 週分

### 9.3 GCP KMS
- 非対称鍵 1 個: $0.06/月
- 署名 API: $0.03/10,000 ops
- VC 1 万件/月 + バッチ署名 → **月 ~$0.10**

### 9.4 DID Document HTTPS 配信
- 既存 civicship-api インフラに乗る → 追加コストなし

### 9.5 Backfill コスト（一回限り）

§10 Phase 3 で実施する 5000 ユーザー DID の初回 backfill:

| 項目 | 値 |
|---|---|
| 戦略 | doc hash のみを chain、doc 本体は HTTPS（§7.4 参照） |
| tx 数 | ~63 tx（80 op/tx × 63 ≒ 5000） |
| Cardano 手数料 | ~11 ADA ≒ **~$5** |
| Blockfrost API 消費 | ~315 call（無料枠の 0.6%、問題なし） |
| 必要日数 | 1-3 日（連続 submit、エラー時のリトライバッファを取る） |

加えて Transaction の初期 Merkle anchor は **1 tx で 5000 件集約可能**（leafIds は metadata 外の DB に保持、root のみ 32 byte chain 書込）→ ~$0.08。

backfill 月のみ ~$5 加算、それ以降は通常運用コストに戻る。

### 9.6 合計

| 項目 | 月額 |
|---|---|
| Blockfrost | $0 |
| Cardano tx 手数料 | ~$0.50 |
| GCP KMS | ~$0.10 |
| その他（GCS, ロギング等） | ~$0.10 |
| **合計** | **~$1/月** |

旧 IDENTUS 運用（VM ＋ Cardano フルノード）と比較して **大幅削減**、かつ運用工数ゼロ。

---

## 10. 段階的リリース

### Phase 0: PoC（1 週間）

実装着手前に **必ず preprod / localhost で検証する 6 項目**:

| # | 検証内容 | 失敗時の影響 |
|---|---|---|
| **0-1** | Cardano preprod で Blockfrost 経由 tx submit → Cardanoscan 等の explorer で metadata 1985 を確認 | submit パス全体が動かない |
| **0-2** | GCP KMS Ed25519 鍵で Cardano tx の `signRaw` API 動作確認（CSL の `make_vkey_witness` 互換の署名が得られるか） | wallet 鍵管理の前提が崩れる、設計大幅やり直し |
| **0-3** | `did:web:civicship.app:users:u_xyz` の DID Document を localhost HTTPS で配信 → 標準 did:web resolver（Veramo / web-did-resolver）で解決確認 | did:web 構文の最終確認 |
| **0-4** | 第三者検証スクリプト（civicship 非依存 / Blockfrost 不使用、Cardano explorer 経由のみ）で end-to-end 検証 | 「Cardano explorer で確認」運用が成立しない |
| **0-5** | GIN index 込みの schema migration を localhost PostgreSQL で実走 → `EXPLAIN ANALYZE` で `&&` 検索が GIN index 使用していることを確認 | `/point/verify` が線形スキャンで遅い |
| **0-6** | metadata label **1985** が CIP-10 (Registered Metadata Labels Registry) で衝突していないことを最終確認（[cardano-foundation/CIPs](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0010/registry.json) の registry.json を直接参照）。衝突時は別番号を再選定（例: civicship 創業年など） | 別 wallet/dApp の metadata 解釈と衝突 |

#### Phase 0 で特に詰めるべき技術的懸念

| 懸念 | 検証内容 | 失敗時の代替 |
|---|---|---|
| **Prisma の GIN index native syntax** | `@@index([leafIds], type: Gin)` が text[] 列に対して直接動くか確認。動かなければ `previewFeatures = ["postgresqlExtensions"]` を試行、それでもダメなら raw SQL migration（`CREATE INDEX ... USING GIN (leaf_ids)`）に切替 | raw SQL migration（実装上ほぼ同等、Prisma が認識しないだけ） |
| **Backfill 時の metadata サイズ** | 100 ユーザー分の DID 操作を実際にバッチ化して Cardano preprod に submit、tx あたり実際に何 op 入るかを実測 | metadata 超過時の自動分割ロジックを strengthen |
| **Cardano CIP-1852 非準拠の影響** | KMS-backed single payment key で生成したアドレスが Daedalus / Eternl / Lace から「正常な civicship issuer wallet」として閲覧可能か確認 | アドレス形式の調整 |

#### Phase 0 受け入れ基準

- [ ] 6 項目すべて pass
- [ ] 上記 3 つの技術的懸念について「採用案で動く」または「fallback 案を確定」
- [ ] preprod 上の検証 tx 数 1 件 ＋ 100 ユーザー分のサンプル backfill が完走
- [ ] PoC 用コードは throwaway として明記（Phase 1 で書き直す前提）

### Phase 1: 内製発行（フラグ OFF 配置、2 週間）

- 全コード（DID 発行・VC 発行・anchor バッチ・/point/verify 新版）を main にマージ
- feature flag `INTERNAL_DID_VC_ENABLED=false`、本番では既存 IDENTUS 経路を維持
- preprod 環境で完全な E2E 動作を確認

### Phase 2: 影 dual-write（1 週間）

- 本番で `INTERNAL_DID_VC_ENABLED=true`（DID/VC は IDENTUS と内製の両方で発行、内製は表示には使わない）
- /point/verify は新版 SQL 経路に切替（既に互換性あり）
- 1 週間運用してエラーログ確認

### Phase 3: 内製カットオーバー（3-5 日）

DID backfill は metadata 制約で複数 tx 必要。段階的に実施:

**Day 1**:
- 全 5000 ユーザーの **DB 上の `DidIssuanceRequest` 行**を `INTERNAL` で一括 INSERT（DB 操作のみ、chain 不問）
- 全ユーザーの DID Document を HTTPS で配信開始（`/users/{id}/did.json`）
- Transaction の Merkle anchor を **1 tx で backfill submit**（leafIds は DB に保持、root のみ chain）
- UI 側で `did:web:...` 表示に切替（DID Issuance Request の最新行が INTERNAL になる）

**Day 2-4**:
- DID 操作の chain backfill（doc hash のみ）を **63 tx に分けて段階 submit**
  - 1 日あたり ~20 tx（Blockfrost / Cardano への負荷分散、エラー時のバッファ）
  - 各 tx confirm 後に該当 UserDidAnchor を CONFIRMED 更新
- 進捗を Slack で日次通知

**Day 5**:
- 全 UserDidAnchor が CONFIRMED であることを確認
- IDENTUS 経路を OFF

**ロールバックポイント**: Day 1 で IDENTUS OFF にせず維持しているため、Day 2-4 のいずれの時点でも feature flag OFF で IDENTUS 経路に戻せる。

**コスト**: backfill 全体で ~$5（§9.5 参照）。

### Phase 4: IDENTUS 撤去（次スプリント以降）

- `requestDIDVC` / `syncDIDVC` バッチ、`DIDVCServerClient`、IDENTUS 系 client コードを削除
- env 変数 `IDENTUS_API_URL` / `IDENTUS_API_KEY` / `IDENTUS_API_SALT` を削除
- `identus-cloud-agent-vm` をシャットダウン → コスト削減確認

### ロールバック

- Phase 3 までは feature flag OFF で IDENTUS 経路に戻せる
- Phase 4 以降のロールバックは不可（IDENTUS 撤去後）→ Phase 3 の 1 週間で十分検証してから進む

---

## 11. テスト戦略

### 11.1 ユニット
- `kmsSigner`: KMS をモック、署名ペイロード一致を確認
- `userDidGenerator`: 既知の鍵から既知の `did:web:...` ＋ DID Document が生成されることを RFC ベクトルで検証
- `merkleTreeBuilder`: leaf 集合 → root 計算、proof 検証
- `txBuilder`: metadata 1985 のサイズ計算、CBOR エンコード結果のバイト一致

### 11.2 統合
- VC 発行〜DB 保存〜JWT 検証〜DID Document 解決の E2E
- Cardano preprod 実環境で submit→confirm→verify の全周
- 5000 件 backfill のドライラン（実際の Tx は出さない）

### 11.3 互換性
- 既存 `vcIssuanceRequests` GraphQL クエリの返却形が変わっていないことを既存テストで確認
- 既存 IDENTUS データのレコードが `vcFormat=IDENTUS_JWT` で読めること
- `/point/verify` レスポンスが既存形式と完全一致すること

---

## 12. オープンクエスチョン

| # | 内容 | 状態 |
|---|---|---|
| ~~Q0~~ | ~~Cardano にアンカしているのが外向きの約束か~~ → **クローズ: 助成金条件で確定** | ✅ クローズ |
| ~~Q1~~ | ~~`/point/verify` の現実の呼び出し元と使用頻度~~ → **クローズ: `TransactionVerificationService` 単独。Transaction Merkle 検証専用** | ✅ クローズ |
| ~~Q2~~ | ~~Issuer DID のドメインは civicship.app でよいか~~ → **クローズ: `civicship.app` で確定** | ✅ クローズ |
| ~~Q3~~ | ~~既発行 IDENTUS DID/VC の表示用 UI~~ → **クローズ: `DidIssuanceRequest` 最新行が `INTERNAL` になることで自動的に新表示**。旧行は履歴として保持 | ✅ クローズ |
| ~~Q4~~ | ~~アンカリング粒度（1h vs 24h vs 件数閾値）~~ → **クローズ: 週次バッチ。Transaction Merkle root バックフィルは 1 tx に集約、DID backfill は metadata 制約で ~63 tx に分割（§7.4 / §10 Phase 3 参照）** | ✅ クローズ |
| ~~Q5~~ | ~~Solana 過去ネットワーク停止リスクのバックアップ~~ → **クローズ: Cardano 単独で確定（助成金条件）** | ✅ クローズ |
| Q6 | 独自 cryptosuite `civicship-merkle-anchor-2026` の仕様書を `docs/specs/` に公開 → 必要なら W3C registry 登録、CIP 提案 | 後回し可（Cardano explorer ベース運用なら影響なし） |
| ~~Q7~~ | ~~User DID 秘密鍵の保管方法~~ → **クローズ: platform-issued モデルでは秘密鍵を保持しない（生成直後に破棄、公開鍵のみ DB 保存）。詳細は §8.1.2** | ✅ クローズ |
| Q8 | DID 鍵ローテのトリガー（年次自動 / 漏洩検知時のみ） | プロダクト判断 |
| Q9 | metadata label の最終確定（**現在 1985 を仮使用**） | civicship 専用 CIP を提案するか、安定運用後に固定。現時点では 1985 で実装、後から CIP 番号を取得して移行可能 |
| Q10 | DID Document の chain 格納戦略（doc 込み or hash のみ）の運用後判断 | backfill は hash のみ（§7.4）。新規発行は doc 込み採用。運用 6 ヶ月後に metadata サイズ・コストを評価して見直し |

---

## 13. 受け入れチェックリスト

- [ ] Phase 0 PoC で第三者検証スクリプトが pass する（civicship 非依存で chain だけから DID/VC を検証可能）
- [ ] Cardano explorer で metadata label 1985 を見ると root と DID 操作が読める形で表示される
- [ ] Phase 1 で全コードが main にマージされ、feature flag OFF で既存運用と完全互換
- [ ] Phase 2 影 dual-write で 7 日間エラーゼロ
- [ ] Phase 3 cutover で全 5000 ユーザーの DID 表示が `did:web:...` に切替
- [ ] Phase 3 で旧 5000 件 Transaction の anchor が CONFIRMED
- [ ] `/point/verify` が IDENTUS API を一切呼ばずに動作
- [ ] 月額運用コストが $5 以下を 1 ヶ月維持
- [ ] Phase 4 で `identus-cloud-agent-vm` がシャットダウン済み
- [ ] 第三者監査資料として「Cardano explorer で全 DID/VC が検証可能」のドキュメントを公開

---

## 付録 A: 用語

| 用語 | 説明 |
|---|---|
| **Anchor** | チェーン上に root hash を記録する行為 |
| **Merkle root** | 多数のリーフをまとめた木構造の最上位 hash |
| **CIP-20 / Label 674** | Cardano の汎用メタデータラベル（任意のテキスト・JSON を記録できる） |
| **Blockfrost** | Cardano API SaaS（Five Binaries 提供、Cardano Foundation 公認） |
| **IOG** | Input Output Global（旧 IOHK）。Cardano と Atala PRISM の主要開発元 |
| **IDENTUS** | 旧 Atala PRISM の現行名。Hyperledger Foundation 配下に移管済み |
| **`did:web`** | W3C 標準 DID method。HTTPS GET で DID Document を解決 |
| **`did:prism`** | PRISM 専用 DID method。Cardano 上に Document を直接記録、PRISM resolver 必須 |
| **CBOR** | バイナリ JSON 風エンコード。Cardano が tx 表現に採用 |

## 付録 B: 検証フロー（外部 verifier 視点）

シナリオ: 外部監査人がユーザー `u_xyz` の VC が真正であることを検証する。

```
1. ユーザーから VC JWT を受領
2. JWT デコード → header.kid から Issuer DID を取得
   = "did:web:civicship.app#key-1"
3. https://civicship.app/.well-known/did.json を HTTPS GET
   → Issuer DID Document の verificationMethod を取得
4. JWT 署名を Issuer 公開鍵で検証 → OK
5. credentialSubject.id から Subject DID を取得
   = "did:web:civicship.app:users:u_xyz"
6. https://civicship.app/users/u_xyz/did.json を HTTPS GET
   → Subject DID Document を取得
   → proof フィールドに { anchorTxHash, root, merkleProof, leafIndex } が入っている
7. Cardano explorer (https://cardanoscan.io/transaction/{anchorTxHash}) を開く
   → metadata label 1985 に { "did_ops": [...] } が表示される
   → 該当 op の doc_hash が Subject DID Document の hash と一致 → OK
8. （オプション）VC が anchor 済みかも確認したい場合
   → VC JWT の hash を Transaction Merkle proof で root に再構築 → root が CONFIRMED な TransactionAnchor のものと一致 → OK
9. すべて整合 → VC は真正

検証で触れたインフラ:
  - civicship.app (HTTPS) ← 1 次解決のみ。倒産しても 7-9 で検証可能
  - cardanoscan.io ← Cardano 公開チェーンの explorer。複数の独立運営あり
  - 検証コード ← did:web resolver と Merkle proof 検証ライブラリのみ。特定ベンダ依存なし
```

これにより、**特定ベンダ（IOG / civicship 自身）への信頼に依存せず、Cardano チェーンと W3C 標準仕様だけで検証完結**する設計になっている。
