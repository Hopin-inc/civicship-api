# DID/VC 内製化 設計書

外部委託している Hyperledger IDENTUS（旧 Atala PRISM、IOG 開発）から脱却し、DID/VC 発行を**自前で署名・Cardano に直接アンカリング**する設計案。

- 作成日: 2026-05-08（最終更新: 2026-05-09）
- 対象ブランチ: `claude/did-vc-internalization-review-eptzS`
- 公開台帳: **Cardano Mainnet**（助成金条件で確定）
- チェーン書込: **Blockfrost SaaS**（自前 Cardano フルノード不要）
- DID method: **`did:web`**（Issuer / User）＋ Cardano チェーン anchor（hybrid 設計：HTTPS 一次解決 ＋ chain 改ざん不能性）
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

### 1.0 規模感（前提数値）

設計のあらゆる箇所で参照される数値（混同注意）:

| 対象 | 件数 | backfill 戦略 |
|---|---|---|
| **Transaction**（point 取引） | **~5,000 件** | 1 tx に集約（Merkle root のみ chain）→ ~$0.08 |
| **User**（DID 対象） | **~1,000 人** | hash-only 戦略で ~13 tx に分散 → ~$1（§7.4） |
| **VC**（既発行 + 内製化分） | 年間 ~10,000 発行想定 | 週次バッチで Merkle root を chain に（StatusList 1 個で 13 年分） |

### 1.1 内製化の対象（3 系統）

| 系統 | 現状 | 目標 |
|---|---|---|
| **(A) Transaction の Merkle anchoring** | civicship-api が `MerkleCommit`/`MerkleProof` をローカル計算 → IDENTUS Cloud Agent が Cardano に submit | civicship-api 自身が Blockfrost 経由で submit。週次バッチ |
| **(A') VC の Merkle anchoring** | IDENTUS が裏で Cardano に anchor していた | 自前で VC 集約 → Merkle root を Cardano metadata に書込（§A 対応：レビュー指摘で本 PR にスコープ追加） |
| **(B) DID/VC の発行＋ DID 操作履歴の chain 記録** | IDENTUS API 経由で `did:prism` 発行 ＋ PRISM 内部で履歴管理 | `did:web` ＋ DID 操作（create/update/deactivate）を Cardano に記録 |

3 系統は**同じ Blockfrost-based Cardano 書込基盤を共有**し、**1 つの週次バッチ tx に同梱**される。

### 1.2 非ゴール

- 既発行の `did:prism:...` レコードを書き換えること（旧行は履歴として残し、新規 `DidIssuanceRequest` 行を `INTERNAL` で追加することで上書き表示）
- 既存 `t_merkle_commits` / `t_merkle_proofs` への新規書き込み・スキーマ拡張（**死蔵テーブル扱い**、新規 anchor は別テーブル）
- ユーザーへのウォレット配布・自己管理 DID（self-sovereign）への切替（platform-issued を維持）
- 革新的な VC データモデル変更（既存 `EvaluationCredential` 構造を流用）

### 1.3 成功基準

1. `/point/verify` が外部 HTTP 呼び出しゼロでローカル DB 参照のみで応答
2. 新規 DID/VC が IDENTUS API を一切呼ばずに発行される
3. 任意の第三者が **Cardano explorer + HTTPS GET** だけで DID/VC の存在・内容を独立検証できる
4. DID の鍵ローテ・deactivate が **Cardano 上に追跡可能な履歴**として記録される（`did:prism` の機能性を異なるトラストモデルで再現、§3.3）
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
  - `src/presentation/batch/requestDIDVC/` ← 内部で 2 ファイル構成（注意: feature flag 切替時は両方とも対象）
    - `index.ts` ← entry
    - `requestDID.ts` ← DID 発行ジョブ起票
    - `requestVC.ts` ← VC 発行ジョブ起票
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
  did:web 文字列を userId から決定論的に組み立て（鍵生成なし、§B 対応）
  最小 DID Document 構築（{id} のみ。verificationMethod は省略 — platform-issued + VP なしのため）
  DidIssuanceRequest INSERT (didMethod=INTERNAL, didValue=did:web:...)
  UserDidAnchor INSERT (operation=CREATE, status=PENDING, version=0)
  ↓
[VC 発行]
  Subject DID = 上記 did:web:...
  Issuer DID = did:web:api.civicship.app
  StatusList から次の index を予約（VC revocation 用、§7 / §D 対応）
  KMS で Ed25519 署名 → VC JWT 生成（credentialStatus 埋込）
  VcIssuanceRequest INSERT (vcFormat=INTERNAL_JWT, vcJwt=..., statusListIndex=N)
  ↓
[週次バッチ（毎週日曜 02:00 JST）]
  ┌─ (A)  Transaction Merkle root 計算 → TransactionAnchor INSERT (status=PENDING)
  ├─ (A') VC Merkle root 計算（前回バッチ以降に発行された VC、§A 対応）
  │       → VcAnchor INSERT (status=PENDING)
  │       → VcIssuanceRequest.vcAnchorId / anchorLeafIndex を埋める
  └─ (B)  DID 操作集合 → UserDidAnchor 行を集約 (status=PENDING)
  ↓
  Blockfrost API (HTTPS) で Cardano に tx submit
  metadata label 1985 に { v, ts, tx, vc, ops[] } を格納（§5.1.6 参照、key 名は短縮形で統一）
  ↓
  Cardano チェーン
  ↓
  status: PENDING → SUBMITTED → CONFIRMED（3 種別すべて同時遷移）

[VC 失効（任意のタイミング）]
  対象 VcIssuanceRequest.statusListIndex のビットを立てる
  StatusListCredential.encodedList を更新 → 新版 VC JWT 再発行（KMS 署名）
  HTTPS で配信中の /status/list/{key} は即座に新版を返す（chain anchor 不要）

[DID 解決（外部 verifier）]
  https://api.civicship.app/users/u_xyz/did.json (HTTPS GET)
  → DID Document を取得
  → proof: { anchorTxHash, opIndexInTx, docHash, anchorStatus: "confirmed"|"pending" }
  → 任意の Cardano explorer で proof.anchorTxHash の metadata 1985 を確認
  → ops[opIndexInTx].h == docHash なら chain 整合 OK（§C: Merkle proof 不要、op が直接ある）

[VC 検証（外部 verifier）]
  VC JWT デコード → kid から Issuer DID 解決 → KMS 公開鍵取得
  Issuer 公開鍵で署名検証 → OK
  credentialStatus.statusListCredential を fetch → 該当 bit を確認 → not revoked
  （optional, 監査時のみ）VC が anchor 済かを VcAnchor.leafIds で確認 → root を chain と突合

[api.civicship.app 消失時の緊急時 fallback]
  Cardano explorer で metadata 1985 を時系列で取得
  → DID 操作履歴を再構築（documentCbor から DID Document を復元）
  → VC root は chain にあるが VC JWT 本体は別途保全要（IPFS / 監査人保管 等は §11 で議論）
```

### 3.2 核心判断

| 判断 | 採用 | 理由 |
|---|---|---|
| 公開台帳 | **Cardano Mainnet** | 助成金条件で固定 |
| チェーン書込 | **Blockfrost SaaS** | フルノード不要 → 今回の障害クラスを構造ごと排除 |
| DID method | **`did:web:api.civicship.app`** | W3C 標準・Universal Resolver 対応・PRISM 非依存 |
| User DID | **`did:web:api.civicship.app:users:u_xyz`** | 全ユーザーが同じ method、`did:web` resolver で解決可能 |
| DID 操作の chain 記録 | **civicship 専用 metadata label 1985 に直接書込** | 操作履歴・鍵ローテ・deactivate を hybrid モデルで維持（§3.3） |
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
| ベンダ消失時の resolve | chain＋PRISM resolver があれば可能 | api.civicship.app 消失時、Cardano metadata 1985 から op 履歴を時系列スキャン → DID Document 再構築可能 |
| Cardano 上の改ざん耐性 | 同等 | 同等（同じチェーンに直接書く） |
| 平常時の resolve 速度 | chain クエリ必須 | HTTPS GET 1 回（速い） |
| 必要なクライアント | PRISM SDK / IDENTUS resolver | 標準 did:web resolver（あらゆるツール） |

**重要な前提**: 本設計の「chain 単独 resolve」は**専用ツール**を要する（CSL でメタデータ展開＋ CBOR デコード＋ hash chain 検証）。一般 verifier は HTTPS で resolve、chain anchor は audit / 改ざん検知用途。

#### トラストモデルの違い

| 想定 | `did:prism` | 本設計 |
|---|---|---|
| civicship が DID Document を改竄 | 困難（chain に直接書込のため） | 可能（HTTPS なので）、ただし **chain anchor の hash と不整合** で検出可能 |
| `civicship.app` の DNS / TLS 乗っ取り | 該当しない（HTTPS 不要） | あり得る、ただし **chain anchor で検出可能**（§10.6 参照） |
| IOG / Atala プロジェクトの停止 | resolver メンテ停止 → 困難 | 影響なし |
| Cardano チェーンの停止 | resolve 不可 | HTTPS 解決のみ可能、chain audit は不可 |

→ 各失敗モードで完全な耐性を持つわけではないが、**現実的な脅威分布の幅広いカバレッジ**を持つのがこの hybrid 設計の特徴。

### 3.4 採用ライブラリ（npm）

| 用途 | パッケージ | 備考 |
|---|---|---|
| VC JWT 発行・検証 | `did-jwt-vc` ＋ `did-jwt` | W3C 準拠、アクティブメンテ |
| DID Resolver | `did-resolver` ＋ `web-did-resolver` | did:web 解決、ライブラリ依存最小 |
| 鍵生成 (Ed25519) | `@noble/ed25519@^2.x` | 監査済、依存ゼロ。**v2 系で固定**（v1 は sync API、v2 は async — `did-jwt` の v8 系と互換確認済み）（§T 対応） |
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

  // VC anchor との紐付け（§A: VC は Merkle anchor する）
  vcAnchorId      String?   @map("vc_anchor_id")
  vcAnchor        VcAnchor? @relation(fields: [vcAnchorId], references: [id])
  anchorLeafIndex Int?      @map("anchor_leaf_index") // バッチ内の VC リーフ位置（proof 動的生成）

  // VC revocation（StatusList 2021 / Bitstring Status List 互換）
  // statusListIndex はビット位置、StatusListCredential.id を経由して状態取得
  statusListIndex     Int?    @map("status_list_index")
  statusListCredential String? @map("status_list_credential") // どのリストに含めるか（URL or ID）
  revokedAt           DateTime? @map("revoked_at")
  revocationReason    String?   @map("revocation_reason")

  @@index([vcAnchorId])
  @@index([statusListCredential, statusListIndex])
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

  // §5 idempotency 対応：本 anchor がどの batch 実行で submit されたかを CAS で固定
  // PENDING 中は NULL、batch 取得時に SELECT ... FOR UPDATE 相当で batchId を埋める
  batchId       String?      @map("batch_id")

  attemptCount  Int          @default(0) @map("attempt_count")
  lastError     String?      @map("last_error") @db.Text

  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime?    @updatedAt @map("updated_at")

  @@index([status])
  @@index([periodEnd])
  @@index([batchId])
  @@index([leafIds], type: Gin)        // /point/verify の `leaf_ids && $1::text[]` 検索を高速化（必須）
  @@map("t_transaction_anchors")
}

// (A') VC Merkle anchoring 用（新設、レビュー指摘の Critical A 対応）
//
// VC は IDENTUS 時代に Cardano に anchor されており、内製化後も同等の改ざん不能性を維持する必要がある。
// 設計上は TransactionAnchor と並列、leafIds は VcIssuanceRequest.id を保持。
// 同じバッチ tx の中で Transaction root と並んで VC root が metadata に格納される。
model VcAnchor {
  id            String       @id @default(cuid())

  periodStart   DateTime     @map("period_start")
  periodEnd     DateTime     @map("period_end")

  rootHash      String       @map("root_hash")
  // VC リーフは VcIssuanceRequest.id（cuid）を ASC で並べる
  // canonical leaf hash = Blake2b-256(utf8_bytes(vc_jwt)) — JWT 文字列全体の hash
  leafIds       String[]     @map("leaf_ids")
  leafCount     Int          @map("leaf_count")

  network       ChainNetwork
  metadataLabel Int          @default(1985) @map("metadata_label")
  chainTxHash   String?      @map("chain_tx_hash")
  blockHeight   Int?         @map("block_height")

  status        AnchorStatus @default(PENDING)
  submittedAt   DateTime?    @map("submitted_at")
  confirmedAt   DateTime?    @map("confirmed_at")

  // §5 idempotency 対応
  batchId       String?      @map("batch_id")

  attemptCount  Int          @default(0) @map("attempt_count")
  lastError     String?      @map("last_error") @db.Text

  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime?    @updatedAt @map("updated_at")

  vcRequests    VcIssuanceRequest[]

  @@index([status])
  @@index([periodEnd])
  @@index([batchId])
  @@index([leafIds], type: Gin)
  @@map("t_vc_anchors")
}

// (B) DID 操作の chain 記録（did:prism の機能性を hybrid モデルで再現）
//
// 各 DID の各操作（create/update/deactivate）を 1 行で表現。
// 同じ tx に複数行が乗る（バッチ submit のため）。
// previousAnchorId で hash chain を形成し、版履歴を追跡可能。
//
// 注: DID Document には User の verificationMethod は含めない（§B 対応：
// platform-issued + VP なしのため、user 鍵は不要）。
// documentCbor はオプションで、最小構成は { id, deactivated? } のみ。
model UserDidAnchor {
  id              String       @id @default(cuid())

  did             String                                          // "did:web:api.civicship.app:users:u_xyz"
  operation       DidOperation                                    // CREATE / UPDATE / DEACTIVATE

  documentHash    String       @map("document_hash")              // 該当バージョン DID Document の hash (32B hex)
  documentCbor    Bytes?       @map("document_cbor")              // CBOR 圧縮した DID Document（chain 単独 resolve 用、§3.3）
                                                                  // §U: 通常 CREATE/UPDATE は含む、Backfill / DEACTIVATE / metadata 超過時は NULL
                                                                  // 規模見積: 1 op ~600B × 年 100 ops × 5 年 = 300 KB（無視できる）
                                                                  // 10 年以上の運用で気になる場合は古い行を archive 化（Phase 4 後検討）

  previousAnchorId String?     @map("previous_anchor_id")         // 前バージョンへのリンク（hash chain）
  previousAnchor   UserDidAnchor? @relation("DidVersionChain", fields: [previousAnchorId], references: [id])
  nextAnchors      UserDidAnchor[] @relation("DidVersionChain")

  // chain 書込状態
  network         ChainNetwork
  metadataLabel   Int          @default(1985) @map("metadata_label")
  chainTxHash     String?      @map("chain_tx_hash")              // CONFIRMED 後に確定
  chainOpIndex    Int?         @map("chain_op_index")             // 同一 tx 内の何番目の op か（DID 操作の chain inclusion proof）

  status          AnchorStatus @default(PENDING)
  submittedAt     DateTime?    @map("submitted_at")
  confirmedAt     DateTime?    @map("confirmed_at")

  // §5 idempotency 対応
  batchId         String?      @map("batch_id")

  // 楽観的ロック（§H 対応：@updatedAt は CAS 不可なので明示 version 列）
  version         Int          @default(0)

  // ユーザー紐付け（§N 対応：Cascade ではなく Restrict）
  // User 削除は明示的な DEACTIVATE workflow を経るため、Prisma 側では FK 制約のみ
  userId          String       @map("user_id")
  user            User         @relation(fields: [userId], references: [id], onDelete: Restrict)

  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime?    @updatedAt @map("updated_at")

  @@index([did, createdAt])
  @@index([userId])
  @@index([status])
  @@index([batchId])
  @@map("t_user_did_anchors")
}

enum DidOperation {
  CREATE
  UPDATE       // 鍵ローテ等
  DEACTIVATE
}

// (C) Status List 2021 / Bitstring Status List 配信用（§D 対応：VC revocation）
//
// 1 つの StatusListCredential は最大 131,072 ビット（16 KB）の bitstring を保持し、
// それぞれのビットが 1 つの VC の revoked 状態を表す。
// civicship.app の運用想定（年間 ~10,000 VC 発行）では 1-2 リストで十分。
//
// list 自体も VC として KMS で署名して配信（自己参照型）。
model StatusListCredential {
  id              String   @id @default(cuid())

  // 配信 URL の path 部分。例: "1" → /status/list/1
  listKey         String   @unique @map("list_key")

  encodedList     Bytes    @map("encoded_list")        // GZIP 圧縮 bitstring (Multibase base64url で配信時にエンコード)
  vcJwt           String   @map("vc_jwt") @db.Text     // この list 自体の VC JWT (再生成のたびに更新)

  // 次の発行で使う index（追加発行ごとに増分）
  nextIndex       Int      @default(0) @map("next_index")
  capacity        Int      @default(131072)            // 1 list あたりの最大 VC 数

  // §7.3 capacity 到達時の rotation：true なら新規発行は別 list に向かう
  // ただし revoked bit の更新と HTTPS 配信は継続（過去 VC の検証用に永久 live）
  frozen          Boolean  @default(false)

  // 直近の更新（revocation 反映時）
  updatedVersion  Int      @default(0) @map("updated_version")
  lastIssuedAt    DateTime @default(now()) @map("last_issued_at")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime? @updatedAt @map("updated_at")

  @@map("t_status_list_credentials")
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
- `did:web:api.civicship.app` の DID Document を返す
- KMS 公開鍵から JWK を動的生成 → メモリキャッシュ（TTL 1h）
- 鍵ローテ時: 旧鍵を `verificationMethod` に残し、新鍵を `assertionMethod` の先頭に置く

#### 5.1.3 新規: `src/infrastructure/libs/did/userDidBuilder.ts`

**§B 対応：User の鍵は生成しない**。platform-issued + VP なしの設計のもとでは、User DID Document に `verificationMethod` を載せる必要がない（W3C DID Core では omittable）。

```ts
// 純粋関数。鍵生成も DB アクセスもなし
export function buildUserDid(userId: string): string {
  return `did:web:api.civicship.app:users:${userId}`;
}

export function buildMinimalDidDocument(userId: string): MinimalDidDocument {
  return {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: buildUserDid(userId),
    // verificationMethod は省略（W3C 仕様で全 verification relationship が空なら不要）
    // assertionMethod / authentication 等も省略
  };
}

// DEACTIVATE 後の Tombstone（§E 対応：404 ではなく 200 で deactivated を返す）
export function buildDeactivatedDidDocument(userId: string): TombstoneDidDocument {
  return {
    "@context": ["https://www.w3.org/ns/did/v1"],
    id: buildUserDid(userId),
    deactivated: true,
  };
}
```

→ §5.1.3 の旧設計（鍵生成 → 公開鍵を verificationMethod に掲載）は丸ごと不採用。
→ §10.1 から「User DID 公開鍵 / 秘密鍵」の議論ごと削除（§10.1 で対応）。
→ 将来 VP 機能が必要になった場合は、ユーザーデバイス側で鍵生成 → 公開鍵のみサーバに送信して UPDATE op を発行、という拡張パスを §10.1.3 で説明。

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

§A 対応：1 つのバッチ tx に **3 種の anchor** を同時格納する。

```jsonc
{
  "v": 1,                                // schema version
  "bid": "ckxxxxxxxxxxxx",               // batch idempotency key（§5.3.1 対応、cuid）
  "ts": 1746336034,                      // unix ts
  "tx": {
    // Transaction Merkle root（§5.1.7 の Blake2b-256 木）
    "root": "4a7b3c8d9e2f1a0b5c6d7e8f9a0b1c2d3e4f506172839abcdef0123456789ab",
    "count": 5213
  },
  "vc": {
    // VC Merkle root（§A 対応：前回バッチ以降に発行された VC の Blake2b-256 木）
    // leaf hash = Blake2b-256(utf8_bytes(vc_jwt))
    // count=0 の週は省略可能（メタデータサイズ節約）
    "root": "9f8e7d6c5b4a3928110010203040506070809a0b0c0d0e0f1a2b3c4d5e6f7081",
    "count": 87
  },
  "ops": [
    {
      "k": "c",                          // "c" = create / "u" = update / "d" = deactivate
      "did": "did:web:api.civicship.app:users:u_xyz",
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
      "did": "did:web:api.civicship.app:users:u_abc",
      "h": "c3d4...",
      "doc": ["...", "..."],
      "prev": "<prev tx hash, 64 chars>"  // 64 chars (Cardano tx hash は 32 byte)
    },
    {
      "k": "d",
      "did": "did:web:api.civicship.app:users:u_def",
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

→ 5000 件 backfill のコストは §11 Phase 3、§9 で再計算（後述）。

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

外部 verifier が proof を独立検証するために、上記のエンコーディングルールは `docs/specs/civicship-merkle-anchor-2026.md`（独自 cryptosuite spec、§13 Q6 参照）に記載し、GitHub で公開する。

### 5.2 Application 層

#### 5.2.1 ドメイン: `account/identity/didIssuanceRequest`

修正対象: `service.ts` / `usecase.ts`

```ts
// Before（IDENTUS）
async create(ctx, userId): Promise<DidIssuanceRequest> {
  const job = await identusClient.createDid(...);
  // ジョブ ID 保存、ポーリング待機
}

// After（INTERNAL、§B 対応：鍵生成なし）
async create(ctx, userId, tx?): Promise<DidIssuanceRequest> {
  const did = buildUserDid(userId);                       // 純粋関数、鍵なし
  const document = buildMinimalDidDocument(userId);       // { id } のみ
  await this.repo.create(ctx, {
    userId,
    didMethod: "INTERNAL",
    didValue: did,
    status: "COMPLETED",
  }, tx);
  await this.userDidAnchorRepo.create(ctx, {
    did,
    operation: "CREATE",
    documentHash: blake2b256(canonicalize(document)),
    documentCbor: encodeCbor(document),
    userId,
    network: "CARDANO_MAINNET",
    status: "PENDING",
    version: 0,
  }, tx);
}
```

#### 5.2.2 ドメイン: `experience/evaluation/vcIssuanceRequest`

修正対象: `service.ts`

§A 対応：VC 発行と同時に **次回バッチでの anchor 候補に登録**する。§D 対応：VC に `credentialStatus` を埋込。

```ts
async issueInternal(
  ctx, evaluationId, subjectDid, claims, tx?
): Promise<VcIssuanceRequest> {
  const issuerDid = "did:web:api.civicship.app";

  // §D 対応：StatusList のスロットを予約（CAS で next_index を 1 増分）
  const statusEntry = await this.statusListService.reserveNextIndex(ctx, tx);
  // statusEntry = { listKey: "1", index: 42, statusListCredentialUrl: "https://api.civicship.app/status/list/1" }

  const payload = buildVcPayload({
    issuer: issuerDid,
    subject: subjectDid,
    claims,
    credentialStatus: {
      id: `${statusEntry.statusListCredentialUrl}#${statusEntry.index}`,
      type: "BitstringStatusListEntry",
      statusPurpose: "revocation",
      statusListIndex: statusEntry.index,
      statusListCredential: statusEntry.statusListCredentialUrl,
    },
  });
  const jwt = await didJwt.createVerifiableCredentialJwt(payload, kmsSigner);

  return await this.repo.create(ctx, {
    vcFormat: "INTERNAL_JWT",
    vcJwt: jwt,
    statusListIndex: statusEntry.index,
    statusListCredential: statusEntry.statusListCredentialUrl,
    status: "COMPLETED",
    // vcAnchorId は次回バッチで埋まる
  }, tx);
}
```

VC 本体は anchor 待ちなしで COMPLETED。**ただし anchor 状態は別フィールド**（`vcAnchorId`）で表現するため、UI / API は anchor 完了を待たずに VC を提示できる。

#### 5.2.3 新規ドメイン: `anchor`

`src/application/domain/anchor/`

§A 対応：**3 種類の集約メソッド**を持つ:

- `service.ts`:
  - `collectPendingTransactions(periodStart, periodEnd)` → 期間内の Transaction を集約 → 新 TransactionAnchor 作成
  - **`collectPendingVcs(periodStart, periodEnd)`** → 期間内に発行された VC（vcAnchorId=NULL）を集約 → 新 VcAnchor 作成、各 VcIssuanceRequest.vcAnchorId / anchorLeafIndex を埋める
  - `collectPendingDidOps(beforeTime)` → status=PENDING の UserDidAnchor を集約
- `usecase.ts`:
  - `executeWeeklyBatch()` → 上記 3 つを集めて 1 つの Cardano tx として submit
  - 失敗時の補償: 部分的に CONFIRMED / FAILED が混在しないよう、3 anchor を**同じ tx 内**で扱う
- `recoveryService.ts` (§5 idempotency 対応):
  - `recoverInFlightBatch()` → 起動時に呼ばれる。`batchId` がセット済 / submit 中 / submit 後 に分岐
    - `batchId` セット済かつ chain に該当 batchId の tx 存在 → DB を SUBMITTED 化
    - `batchId` セット済かつ chain に存在しない → 再 submit
    - `batchId` 未セット → 通常通り `executeWeeklyBatch()` 開始
  - Cardano protocol レベルの double-spend 保護で、もし 2 回 submit しても 2 回目はエラーで弾かれる（safety net）
- `repository.ts`:
  - `TransactionAnchor` / `VcAnchor` / `UserDidAnchor` の Prisma クエリ（CAS 含む）

#### 5.2.4 新規ドメイン: `statusList`（§D 対応：VC revocation）

`src/application/domain/statusList/`

- `service.ts`:
  - `reserveNextIndex()`: VC 発行時に呼ばれる。trx 内で StatusListCredential.next_index を atomic CAS で増分し、index を返す
    - **bootstrap 動作**: 該当 listKey の行が DB にない場合（初回 VC 発行時など）、新規行を作成（listKey 採番、空 bitstring、自己署名 VC JWT 生成）してから index 0 を返す
    - **capacity 到達時**: 現 list を `frozen=true` でマーク → 新 listKey で次 list を bootstrap → 新 list の index 0 を返す（§7.5 参照）
  - `revokeIndex(listKey, index)`: 指定ビットを立てる。bitstring を更新し、新版 VC JWT を再発行（KMS 署名）
  - `getEncodedList(listKey)`: HTTPS 配信用に最新の VC JWT を返す。**frozen な過去 list も継続配信**（過去 VC の検証のため永久 live が必要）
- `usecase.ts`:
  - `revokeVc(vcRequestId, reason)`: VcIssuanceRequest を取得 → revokeIndex 呼び出し → revokedAt / revocationReason 記録
- `repository.ts`:
  - `StatusListCredential` の Prisma クエリ（CAS 含む）

### 5.3 Presentation 層（バッチ）

#### 5.3.1 新規: `src/presentation/batch/anchorWeekly/`

```ts
// 毎週日曜 02:00 JST 起動
async function run(ctx) {
  const usecase = container.resolve(AnchorUseCase);
  await usecase.executeWeeklyBatch();
}
```

処理内容（§A 対応：3 種の anchor を同一 tx で扱う）:
1. PENDING な `TransactionAnchor` を 1 件取得（事前に作成済み or その場で作成）
2. **PENDING な `VcAnchor` を 1 件作成**（前回バッチ以降に発行された VC を集約）。各 `VcIssuanceRequest.vcAnchorId` / `anchorLeafIndex` を埋める
3. PENDING な `UserDidAnchor` 群を集約
4. Blockfrost で UTXO ＋ プロトコルパラメータ取得
5. Cardano tx を構築（**`tx.root` ＋ `vc.root` ＋ `ops[]`** を metadata 1985 に格納、§5.1.6 と同じ key）
6. Cardano wallet 鍵 (KMS) で tx hash に署名
7. `txSubmit` 実行 → `chainTxHash` を取得
8. **3 種の anchor の status = SUBMITTED**、各 `chainTxHash` 更新（`UserDidAnchor` には `chainOpIndex` も）
9. Confirmation polling（最大 5 分）→ 全部 `CONFIRMED` 遷移
10. 失敗時はリトライ（`attemptCount` 増分）、3 回失敗で FAILED

注: 一部の anchor だけ CONFIRMED で他が FAILED にならないよう、**3 種は必ず同じ Cardano tx に乗せる**。tx 全体が成功 / 失敗するため、整合性が自然に保証される。

##### Idempotency と二重 submit 防止（§5 対応）

「Cardano tx submit 成功 → DB UPDATE 中にプロセスクラッシュ → DB は古い PENDING のまま、chain は CONFIRMED」になり、次回バッチが同じ leaf 集合で再 submit する **二重 anchor** リスクがある。

対応:

1. **idempotency key**: バッチ実行ごとに `batchId = cuid()` を生成、Cardano tx の metadata 1985 に `"bid": batchId` を含める
2. **DB 側の楽観ロック**: `executeWeeklyBatch` 開始時に「PENDING な TransactionAnchor / VcAnchor / UserDidAnchor」を SELECT FOR UPDATE 相当でロック（`status=PENDING AND batchId IS NULL` → `batchId=<本実行 batchId>` に CAS UPDATE）
3. **submit 前後の crash 復旧**:
   - submit 前 crash: 次回起動時、同じ batchId で行が残っていれば再開（idempotent re-submit）
   - submit 後 / DB UPDATE 前 crash: 起動時に「自分の batchId が metadata にある最新 tx」を Blockfrost で検索 → 存在すれば DB を SUBMITTED 化、存在しなければ再 submit
4. **Cardano tx 自体は Cardano の natural idempotency**: 同じ inputs (UTXO) を含む tx を 2 回 submit すると 2 回目は double-spend エラーで弾かれるため、二重 anchor は protocol レベルで起きない（ただし、別 UTXO で同じ leaf 集合を再 submit するのは可能なので、上記 batchId チェックが要）

実装は §5.2.3 anchor ドメインの `recoveryService.ts` に集約。週次バッチの起動時に `recoverInFlightBatch()` を呼び、未完了 batch の状態を解決してから新規 batch に進む。

#### 5.3.2 既存: `requestDIDVC` / `syncDIDVC`

- `requestDIDVC` は内部で `requestDID.ts` と `requestVC.ts` の 2 ファイル構成。feature flag は **両方に挿入** 必要
- feature flag OFF 時のみ動作（IDENTUS 経路）
- 完全移行後（Phase 4）に 3 ファイル一括削除

### 5.4 公開 API（HTTPS エンドポイント）

DID Document は **civicship-api（`api.civicship.app`）側で実装**する。理由:

- civicship-api が DB（UserDidAnchor 等）を持つので動的生成が直接的
- フロントエンド（Next.js, `civicship.app`）に依存しないので Phase 0 を civicship-api チーム単独で進められる
- `civicship.app` も `api.civicship.app` も同じ GCP Cloud Load Balancer 配下（`34.8.190.174`）→ TLS / HSTS は共有

スタック (実コード確認済): **Express ^4.21.2 + Apollo Server ^4.13.0**。既存の `src/presentation/router/wallet.ts` / `line.ts` を precedent として REST router を追加する。

did:web 構文と URL の関係:

```
did:web:api.civicship.app                    → https://api.civicship.app/.well-known/did.json
did:web:api.civicship.app:users:u_xyz        → https://api.civicship.app/users/u_xyz/did.json
```

#### 5.4.1 新規: `src/presentation/router/did.ts`

Express router を 1 ファイルにまとめる。認証 middleware を route ごとに適用しないだけで bypass を実現（既存 `wallet.ts` の per-route middleware パターン）。

```ts
import express from "express";
import { container } from "tsyringe";
import { IssuerDidService } from "@/application/domain/did/issuerDidService";
import { UserDidDocumentService } from "@/application/domain/did/userDidDocumentService";
import { StatusListService } from "@/application/domain/statusList/service";

const router = express.Router();

// CORS: DID resolver は任意のオリジンから来るので open
router.use((_req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});

// Issuer DID Document
router.get("/.well-known/did.json", async (_req, res) => {
  const issuerService = container.resolve(IssuerDidService);
  const document = await issuerService.buildDidDocument();
  res.set("Content-Type", "application/did+json");
  res.set("Cache-Control", "public, max-age=300"); // 5 分（§G で議論：鍵ローテ overlap 戦略あり）
  res.json(document);
});

// User DID Document（§E/F 対応）
router.get("/users/:userId/did.json", async (req, res) => {
  const userDidService = container.resolve(UserDidDocumentService);
  const document = await userDidService.buildDidDocument(req.params.userId);
  if (!document) {
    // DID が一度も発行されていない場合のみ 404
    return res.status(404).end();
  }
  res.set("Content-Type", "application/did+json");
  res.set("Cache-Control", "public, max-age=60");
  res.json(document);
});

// VC Status List（§D 対応：Bitstring Status List 配信）
router.get("/status/list/:listKey", async (req, res) => {
  const statusListService = container.resolve(StatusListService);
  const vcJwt = await statusListService.getEncodedList(req.params.listKey);
  if (!vcJwt) return res.status(404).end();
  res.set("Content-Type", "application/vc+jwt");
  res.set("Cache-Control", "public, max-age=300");
  res.send(vcJwt);
});

export default router;
```

#### 5.4.2 `src/index.ts` への mount

既存パターン（`app.use("/line", lineRouter)`）に倣い、ルートに mount:

```ts
import didRouter from "@/presentation/router/did";
app.use(didRouter);
```

W3C did:web 仕様準拠:
- パスプレフィックスを付けない（`/.well-known/did.json` は固定パス）
- リダイレクト禁止
- 静的キャッシュ禁止（DB 反映を許容するため動的）

#### 5.4.3 IssuerDidService（§5.1.2 補足）

```ts
@injectable()
export class IssuerDidService {
  constructor(@inject("KmsSigner") private kms: KmsSigner) {}

  // §G 対応：鍵ローテーション中は新旧両方の鍵を含める（24h 並行運用）
  async buildDidDocument(): Promise<DidDocument> {
    const activeKeys = await this.kms.listActiveIssuerKeys();
    // activeKeys = [{ kid: "key-2", jwk: ..., active: true }, { kid: "key-1", jwk: ..., active: false (rotating-out) }]

    return {
      "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/jwk/v1"],
      id: "did:web:api.civicship.app",
      verificationMethod: activeKeys.map(k => ({
        id: `did:web:api.civicship.app#${k.kid}`,
        type: "JsonWebKey2020",
        controller: "did:web:api.civicship.app",
        publicKeyJwk: k.jwk,
      })),
      // 新規発行は active=true の鍵で。既存 VC の検証は両方の鍵で可
      assertionMethod: activeKeys.map(k => `did:web:api.civicship.app#${k.kid}`),
      authentication: activeKeys.map(k => `did:web:api.civicship.app#${k.kid}`),
    };
  }
}
```

#### 5.4.4 UserDidDocumentService（§E/F/C 対応）

§E（Tombstone）、§F（PENDING serving）、§C（proof は Merkle ではなく op 直接参照）を反映:

```ts
@injectable()
export class UserDidDocumentService {
  constructor(@inject("PrismaClient") private prisma: PrismaClient) {}

  async buildDidDocument(userId: string): Promise<DidDocumentWithProof | null> {
    const did = `did:web:api.civicship.app:users:${userId}`;

    // §F 対応：CONFIRMED に絞らず最新の anchor を取得（PENDING も含む）
    const latestAnchor = await this.prisma.userDidAnchor.findFirst({
      where: { did },
      orderBy: { createdAt: "desc" },
    });
    if (!latestAnchor) return null;  // 一度も発行されていない → 404

    // §E 対応：DEACTIVATE は Tombstone を 200 で返す（W3C 推奨挙動）
    if (latestAnchor.operation === "DEACTIVATE") {
      return {
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: did,
        deactivated: true,
        proof: this.buildProof(latestAnchor),
      };
    }

    // CREATE / UPDATE: 最小 DID Document を返す（verificationMethod は省略、§B）
    const baseDocument = latestAnchor.documentCbor
      ? decodeCbor(latestAnchor.documentCbor)
      : { "@context": ["https://www.w3.org/ns/did/v1"], id: did };

    return {
      ...baseDocument,
      proof: this.buildProof(latestAnchor),
    };
  }

  // §C 対応：DID 操作は metadata に直接乗る（Merkle 不要）
  // proof は { anchorTxHash, opIndexInTx, docHash, status } のみ
  private buildProof(anchor: UserDidAnchor): DidDocumentProof {
    return {
      type: "DataIntegrityProof",
      cryptosuite: "civicship-cardano-anchor-2026",
      anchorChain: "cardano:mainnet",
      anchorTxHash: anchor.chainTxHash,        // PENDING 時は null
      opIndexInTx: anchor.chainOpIndex,        // metadata.ops[opIndexInTx] が該当 op
      docHash: anchor.documentHash,            // metadata.ops[opIndexInTx].h と一致するべき
      anchorStatus: anchor.status.toLowerCase(), // "pending" | "submitted" | "confirmed" | "failed"
      anchoredAt: anchor.confirmedAt?.toISOString(),
      verificationUrl: anchor.chainTxHash
        ? `https://cardanoscan.io/transaction/${anchor.chainTxHash}`
        : null,
    };
  }
}
```

§F の実装ポイント:
- 新規 DID は anchor 完了まで最大 7 日間 PENDING、しかし HTTPS 解決は **即座に** 200 を返す
- verifier は `proof.anchorStatus` で chain 確認可否を判定
- 監査要件が厳しい verifier は `confirmed` 状態を待つ、緩い verifier は `pending` でも OK

#### 5.4.5 VC Status List 配信（§D 対応）

`/status/list/:listKey` で BitstringStatusListCredential（VC JWT 形式）を返す。これにより VC verifier は revocation を確認できる。

実装は `StatusListService.getEncodedList(listKey)` が DB から最新の VC JWT を返すだけ。`StatusListCredential.vcJwt` は revocation 反映のたびに KMS で再署名される（§5.2.4）。

#### 5.4.6 オプション: `/anchor/:txHash/verify` ＋ `/vc/:vcId/inclusion-proof`

任意の verifier が civicship 経由で chain 検証したい場合のヘルパ。

##### `/anchor/:txHash/verify` (任意)

内部で Blockfrost を叩いて metadata を proxy 返却。Phase 1 では未実装で OK（verifier は直接 Cardano explorer / Blockfrost を叩けば良い）。

##### `/vc/:vcId/inclusion-proof` （§7 inclusion proof 対応）

VC が VcAnchor に含まれることを proof で示す API。**監査時に必要**（chain 単独で全 anchor を brute-force スキャンするのは非実用、§J 参照）:

```ts
router.get("/vc/:vcId/inclusion-proof", async (req, res) => {
  const vc = await prisma.vcIssuanceRequest.findUnique({
    where: { id: req.params.vcId },
    include: { vcAnchor: true },
  });
  if (!vc?.vcAnchor || vc.vcAnchor.status !== "CONFIRMED") {
    return res.status(404).json({ error: "not yet anchored" });
  }
  const tree = buildMerkleTree(vc.vcAnchor.leafIds);  // §5.1.7 と同じ Blake2b 仕様
  const proof = tree.getProof(vc.anchorLeafIndex!);
  res.json({
    vcId: vc.id,
    leafHash: blake2b256(utf8(vc.vcJwt!)).toString("hex"),
    leafIndex: vc.anchorLeafIndex,
    siblings: proof.map(b => b.toString("hex")),
    root: vc.vcAnchor.rootHash,
    chainTxHash: vc.vcAnchor.chainTxHash,
  });
});
```

→ verifier はこの 1 API call で proof を取得 → ローカルで Merkle 検証 → Cardano explorer で `chainTxHash` の `vc.root` と一致確認 → 完了。

#### 5.4.7 セキュリティ要件（civicship.app / api.civicship.app）

これらのエンドポイントが信頼されるには civicship.app（および api.civicship.app）の HTTPS 信頼が前提。§10.6 参照。

最小チェックリスト（Phase 0 で確認）:

- [ ] DNSSEC 有効化（`dig +dnssec civicship.app DS` で DS レコード確認）
- [ ] CAA レコード設定（証明書発行 CA を Let's Encrypt 等に限定）
- [ ] HSTS ヘッダ送出（`max-age=31536000; includeSubDomains; preload`）
- [ ] HSTS preload list 登録（https://hstspreload.org/）
- [ ] TLS 1.2/1.3 のみ、それ以下は無効化
- [ ] `/.well-known/did.json` `application/did+json` で配信
- [ ] CT log（https://crt.sh/?q=civicship.app）の不審な発行に対するアラート設定

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

## 7. VC Revocation（StatusList 2021）— §D 対応

### 7.1 なぜ必要か

W3C VC を Issuer として運用する以上、**取り消し**は必須機能。誤発行・資格喪失・不正検知への対応:

- 「内製化したけど取り消せません」では本番投入不可
- IDENTUS 時代に revocation がどう運用されていたかは別途確認要だが、同等以上を担保する
- `Status List 2021` ([W3C Working Draft](https://www.w3.org/TR/vc-status-list/)) / `Bitstring Status List` が業界標準

### 7.2 仕組み

```
[VC 発行時]
  StatusList から index N を予約
  VC JWT に credentialStatus 埋込:
    {
      "id": "https://api.civicship.app/status/list/1#42",
      "type": "BitstringStatusListEntry",
      "statusPurpose": "revocation",
      "statusListIndex": 42,
      "statusListCredential": "https://api.civicship.app/status/list/1"
    }

[Revocation 時]
  対象 VC の statusListIndex のビットを 1 に立てる
  bitstring を GZIP 圧縮 → Multibase base64url エンコード
  StatusListCredential 自体を VC として KMS で再署名
  StatusListCredential.vcJwt を更新

[検証時（外部 verifier）]
  VC を取得 → credentialStatus.statusListCredential URL を fetch
  → 返ってきた VC（StatusListCredential 本体）を Issuer 公開鍵で検証
  → encodedList を base64url デコード → GZIP 解凍 → bitstring 取得
  → bitstring[42] == 0 なら not revoked, == 1 なら revoked
```

### 7.3 ストレージ容量と継続性

- 1 list = 131,072 bit = 16 KB（圧縮前）
- civicship 想定: 年間 ~10,000 VC 発行 → 1 list で 13 年分
- 実運用では 1-2 list で十分

**Capacity 到達時の挙動**:
- 現 list を `frozen=true` にマーク（新規発行はしない、既存 VC の revocation 反映は継続）
- 新 listKey で 2 番目の list を自動 bootstrap
- 旧 list URL は **永久に live で配信**（過去 VC の verifier が credentialStatus.statusListCredential を fetch するため）
- アプリ層は「最新の non-frozen list」を `reserveNextIndex` の対象にする

**Write amplification の注意**:
- `revokeIndex` のたびに 16 KB（圧縮前）bitstring を全更新 → PostgreSQL bytea の WAL 量増
- civicship 規模（年間 100 件想定）では問題なし
- 月 100 件超の revoke が常態化したら、bitstring の差分更新 / 別バックエンド検討

### 7.4 chain anchor との関係

**StatusList 自体は chain に anchor しない**:
- 取り消しは即時反映が要件 → 週次バッチを待てない
- HTTPS で最新版を返すモデルが前提
- ただし StatusList の **更新履歴** は監査用途で chain に anchor する選択肢あり（Phase 1 では未実装、後続検討）

### 7.5 実装範囲

**Phase 1 で実装する**:
- `StatusListCredential` テーブル
- VC 発行時の index 予約
- `/status/list/:listKey` エンドポイント
- `revokeVc(vcRequestId, reason)` API（管理者用）

**Phase 2 以降に検討**:
- StatusList 自体の Cardano anchoring（更新履歴の改ざん不能性）
- list の suspended / pending 等の追加状態（現状は revoked のみ）
- list のローテーション戦略（capacity 達成時）

---

## 8. DID 操作のチェーン記録（`did:prism` の機能性を hybrid モデルで再現）

### 8.1 操作の種類とフロー

| 操作 | トリガー | UserDidAnchor.operation | metadata 内の `op` |
|---|---|---|---|
| 新規 DID 発行 | ユーザーオンボーディング | `CREATE` | `"create"` |
| 鍵ローテ | KMS 鍵更新時 / ユーザー操作 | `UPDATE` | `"update"` |
| 失効 | アカウント削除 / 不正検知 | `DEACTIVATE` | `"deactivate"` |

### 8.2 hash chain による履歴整合性

```
[CREATE]   prev: null                         tx: tx1
[UPDATE]   prev: tx1                          tx: tx2  ← tx1 を参照
[UPDATE]   prev: tx2                          tx: tx3  ← tx2 を参照
[DEACTIVATE] prev: tx3                        tx: tx4  ← tx3 を参照
```

各 tx の metadata に `prev` フィールドで前バージョンの `chainTxHash` を入れる。改ざんしようとすると hash chain が破綻するため、Cardano explorer のみで完全な履歴監査が可能。

### 8.3 chain 単独で DID Document を再構築する手順

仮に `api.civicship.app` が消失しても、以下の手順で DID Document を再構築可能:

```
1. 検証者は did:web:api.civicship.app:users:u_xyz の DID 文字列を持っている
2. Cardano explorer / Blockfrost で metadata label 1985 を時系列スキャン
3. did=...u_xyz の op を全件抽出
4. CREATE → UPDATE...→ DEACTIVATE の順に hash chain を辿る
5. 最新非 DEACTIVATE の op の doc_cbor_b64 を CBOR デコード
6. DID Document が復元される
```

これにより `did:prism` と**同等のオンチェーン耐性**が得られる。

### 8.4 metadata サイズの制約と運用

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

#### Backfill 時（§11 Phase 3 で実施）

**ユーザー数 ~1000**（confirmed）の初期 backfill では **1 tx に集約は不可能**（metadata 制約のため）:

| 戦略 | tx 数 | コスト |
|---|---|---|
| **doc 込みで 17 op/tx** | 1000 ÷ 17 ≒ **59 tx** | ~10 ADA ≒ **~$5** |
| **hash のみで 80 op/tx**（doc 本体は HTTPS のみ） ⭐ | 1000 ÷ 80 ≒ **13 tx** | ~2.2 ADA ≒ **~$1** |
| **doc 込み Transaction Merkle root と同梱、複数 tx に均等分散** | ~13-30 tx | ~$1-3 |

→ **採用案: doc hash のみを chain に書く軽量 backfill**（**~$1**）。doc 本体は HTTPS で配信、必要時のみ doc を chain に書く UPDATE op を発行。これにより backfill コストを抑えつつ、運用フェーズに入ってからの新規発行は doc 込み op を採用できる。

##### `documentCbor` 含めるかの判断ルール（§U 対応）

実装上の分岐は `AnchorService.collectPendingDidOps()` 内で次のように決める:

| シナリオ | `documentCbor` を含めるか |
|---|---|
| 通常の新規 CREATE / UPDATE | **含める**（chain 単独 resolve のため、§3.3 の hybrid 性が成立） |
| Phase 3 backfill 時の CREATE | **含めない**（コスト抑制、~$1 で済む） |
| DEACTIVATE op | **含めない**（doc は無関係） |
| metadata 16 KB 超過時の超過 op | **含めない**（hash のみで分割、次回バッチに繰越でも可） |

判断ロジック:
```ts
const includeCbor =
  !isBackfillMode &&
  op !== "DEACTIVATE" &&
  predictedTxSize + cborSize < METADATA_LIMIT;
```

→ Phase 0 の検証項目 0-2(b) で metadata size の実測を行い、判定境界の精度を上げる。

→ §10 のコスト試算は **backfill 月のみ別計上**（一回限り **~$1**、その後は通常運用 ~$1/月）。

---

## 9. セキュリティ設計

### 9.1 鍵管理

#### 9.1.1 鍵の種類と保管（§B 対応：User 鍵は完全に存在しない）

| 鍵 | 用途 | 保管場所 | ローテ |
|---|---|---|---|
| **Issuer VC 署名鍵**（Ed25519） | VC JWT 署名 ＋ DID Document 関連の署名 | **GCP KMS**（鍵素材は KMS 外に出ない、`global` location 推奨） | 年次（§9.1.2 参照、24h 並行運用付き） |
| **Cardano wallet 鍵** | tx 署名 | **GCP KMS**（HSM-backed key ring） | 半年に 1 回（§9.1.3） |
| **StatusList 署名鍵** | 取り消しリスト VC の署名 | Issuer 鍵を兼用（同一） | 同上 |

→ **User 鍵は存在しない**（§B）。platform-issued + VP なしの設計のため、ユーザーが署名する場面が一切ない。User DID Document の `verificationMethod` も省略する。

#### 9.1.2 Issuer 鍵のローテーション戦略（§G 対応）

`/.well-known/did.json` の Cache-Control を 5 分にしても、DID resolver のキャッシュ動作は仕様未定義。Veramo / Universal Resolver / Microsoft Resolver で挙動が異なる。**鍵ローテ直後 5 分間 古い JWK で署名検証 → 失敗** のリスクがある。

対応：**24 時間の並行運用** を組む:

```
[Day -1]  KMS 鍵バージョン N 単独で運用中
          DID Document.verificationMethod = [#key-N]

[Day 0]   新鍵 N+1 を KMS に作成、active=true に追加
          DID Document.verificationMethod = [#key-N+1, #key-N]
          ↑ この瞬間から両方の鍵で検証成功する
          新規 VC は #key-N+1 で署名（assertionMethod の先頭）

[Day 1+]  全 resolver キャッシュが切れて 24h 経過
          KMS の N を rotating-out として deactive 化（ただし DESTROY しない）
          DID Document.verificationMethod = [#key-N+1]
          旧鍵 N で署名された VC の検証は §9.1.3 で説明
```

→ §5.4.3 の `IssuerDidService.buildDidDocument` で複数鍵を `verificationMethod` に並べる実装。

#### 9.1.3 旧鍵で署名された VC を未来永劫検証可能にする戦略

VC は**過去のスナップショット**として有効期限内なら永久に検証可能でなければならない。鍵ローテ後も:

- 旧鍵 (`#key-N`) で署名された VC が DB に残っている
- verifier が fetch する Issuer DID Document は新鍵 (`#key-N+1`) のみ載せている
- → 旧鍵での検証ができない

##### 対応方針：旧鍵公開鍵の永続保持

| 戦略 | 実装 | 評価 |
|---|---|---|
| (a) 旧鍵を `verificationMethod` に永久に残す | DID Document が時間とともに肥大化 | ◯ シンプル、本設計で採用 |
| (b) 旧鍵公開鍵を `t_issuer_keys` 等に DB 永続化、resolver が結合 | 別テーブル必要 | △ 複雑、不要 |
| (c) Cardano metadata に旧鍵公開鍵を anchor、resolver が chain から取得 | chain 単独で歴史的 verification 可 | △ overhead 大 |

採用は **(a) verificationMethod に永久保持**（civicship 規模なら DID Document が数 KB 増える程度、許容範囲）。

##### KMS の鍵バージョン状態

GCP KMS の鍵バージョンには 4 状態がある:

| 状態 | 公開鍵取得 | 署名 | 採用ポリシー |
|---|---|---|---|
| `ENABLED` | ✅ | ✅ | 現役の鍵（assertionMethod の先頭） |
| `DISABLED` | ✅ | ❌ | rotating-out 後の旧鍵（**verificationMethod に残す**） |
| `DESTROY_SCHEDULED` | ✅ | ❌ | 30 日後 DESTROY 予定（基本使わない） |
| `DESTROYED` | ❌ | ❌ | 公開鍵すら取得不可 → **永久に DESTROY しない** |

→ 旧鍵は DISABLED 状態で**永久保持**（KMS の月次費用 $0.06/key、許容範囲）。`DESTROYED` には絶対しない。これが旧 VC 検証可能性の根幹。

→ §11 Phase 4 完了後の運用で「不要な鍵を整理」とは絶対しない。鍵は資産として永続。

#### 9.1.4 Cardano wallet 鍵の HSM 保管と single-payment-key 設計

##### KMS 経由の tx 署名

- GCP KMS の Ed25519 鍵で `asymmetricSign` を呼び出し → tx hash に対する署名を取得
- 秘密鍵素材は KMS の HSM 内から一切出ない
- アプリケーションコードは「署名要求」のみ送信、署名結果のみ受け取る

##### CIP-1852 HD wallet ではなく single-payment-key 設計を採用

通常の Cardano wallet は CIP-1852（BIP-32 ベースの階層的決定性鍵）で、master seed から複数アドレスを派生させる。これは KMS の `asymmetricSign` API では実現できない（KMS は固定鍵に対する署名 API のみ提供）。

→ 本設計では **1 つの payment key = 1 つの civicship issuer wallet address**（single-payment-key）を採用:

| 項目 | CIP-1852 HD wallet | **本設計 (single-payment-key)** |
|---|---|---|
| アドレス数 | 多数（per-tx で変更可能） | 1 つに固定 |
| 鍵管理 | seed phrase | KMS の鍵バージョン |
| プライバシー | アドレスを変えて履歴を分離 | 全 tx が同じアドレスから発信 |
| 残高管理 | 複数 UTXO 分散 | 1 アドレスに集約 |

##### single-payment-key のトレードオフ

- メリット: KMS で完結（seed phrase の保管・バックアップが不要）、監査人が「civicship issuer wallet」を 1 アドレスで追跡可能
- デメリット: プライバシーがゼロ（civicship の全 anchor tx が紐づいて見える）。ただし civicship の anchor は**公開して構わない**性質なので問題なし
- 鍵ローテ時のアドレス変更: 旧アドレスから新アドレスに残 ADA を移送（手動 tx 1 回、~$0.10）。旧アドレスは過去 anchor の改ざん検知用に保持

##### Issuer wallet ADA 残高管理

- 50 ADA を float として保持（200+ 週分）
- 残高が 10 ADA 切ったら Slack 通知 → 手動補充
- 補充頻度: 年に 1-2 回程度

#### 9.1.5 KMS のリージョン障害対応（§L 対応）

GCP KMS は `global` location を選べる（複数リージョンに自動 replicate）。本設計では:

- **KMS 鍵リング `civicship-issuer` は `global` location で作成**（マルチリージョン耐性）
- リージョン障害時は同一 keyResource を別リージョンの KMS API endpoint 経由で利用可能
- アプリケーション側は KMS API のリトライ・retry-on-different-region ロジックを実装

#### 9.1.6 将来 VP 対応が必要になった場合（§B の別ケース）

「ユーザーが自身の VC を別のサービスに提示し、署名で本人性を示す」要件が出た場合の移行パス:

1. ユーザーデバイス側で鍵ペア生成（Web Crypto API / Secure Enclave）
2. 公開鍵のみをサーバに送信、サーバは UserDidAnchor の UPDATE op で公開鍵を `verificationMethod` に追加
3. 秘密鍵は**ユーザーデバイス内のみ**に保持（サーバには絶対に送らない）
4. VP 署名はクライアント側で行い、サーバは公開鍵で検証のみ

→ この移行は本設計の Phase 4 完了後の独立タスクとして扱う（本 PR のスコープ外）。本 PR では `verificationMethod` を含めずに DID Document を発行するため、後続の追加で破壊的変更にならない（追加のみ）。

### 9.2 入力検証

- **DID 文字列フォーマット検証**（実装解釈ズレ防止のため regex を仕様化）:
  ```
  ^did:web:api\.civicship\.app(:users:[a-z0-9_-]+)?$
  ```
  - 完全一致しない場合は 400 で reject
  - userId 部分は cuid 互換（`[a-z0-9]` ASCII）。大文字・記号は不可
- Merkle leaf として使う Transaction.id の存在確認
- 重複 anchor 防止（unique constraint on `chain_tx_hash`）
- VC 発行時の Issuer 一致検証: `vcJwt.iss === "did:web:api.civicship.app"`

### 9.3 Cardano confirmation

- `txs/{hash}` を polling、block_height が取得できれば 1 confirmation
- 5 confirmation 経過で `CONFIRMED` 遷移（実用的な finality）
- 失敗時はリトライ、3 回失敗で `FAILED`

### 9.4 リプレイ・順序保証（§H 対応）

- 同 DID への UPDATE は `previousAnchorId` を直前の CONFIRMED 行に固定
- chain 上では `prev` フィールドで前 tx hash を参照 → 攻撃者が op を入れ替えると hash chain が破綻して検出
- 並行更新は **明示的な version 列** で CAS（Compare-and-Swap）

```ts
// ❌ 誤った実装（@updatedAt は SET on UPDATE で自動上書きされるため CAS 不可）
where: { id, updatedAt: prevUpdatedAt }

// ✅ 正しい実装（§4.1 で `version Int @default(0)` を明示追加済み）
const result = await prisma.userDidAnchor.updateMany({
  where: { id, version: prevVersion },
  data: { ...newFields, version: { increment: 1 } },
});
if (result.count === 0) {
  // 並行更新が発生 → リトライ or エラー
  throw new ConcurrentUpdateError();
}
```

### 9.5 失敗モード

| 失敗 | 影響 | 対応 |
|---|---|---|
| Blockfrost API 障害 | submit 不可 | リトライ → 次回バッチに繰越 |
| Blockfrost STARTER 50,000 req/日上限到達（§M） | 403 / rate-limit | キャッシュ強化 / 有料プラン昇格 / Helius 等の代替を Phase 2 で評価 |
| Cardano 一時的混雑 | confirm 遅延 | confirmation 待機タイムアウト延長 |
| Issuer wallet ADA 残高不足 | submit エラー | Slack 通知＋手動補充 |
| KMS リージョン障害（§L） | 当該リージョンのみ署名不可 | KMS `global` location なら自動 failover、retry-on-region で対応 |
| KMS 完全停止 | VC 発行不可、既存 VC 検証も困難 | GCP 全体障害級（既存 civicship-api と同等のリスク） |
| Cardano Hard Fork（§P） | CSL バージョン互換性 | 6 ヶ月前に告知 → §11 末尾の SOP に従い CSL / Blockfrost SDK を更新 |

### 9.6 DNS / TLS 乗っ取りに対する脅威モデル（did:web 固有）

#### 脅威

`did:web` は HTTPS で DID Document を解決するため、以下の攻撃面が存在する:

| 攻撃 | 結果 |
|---|---|
| 攻撃者が `civicship.app` の DNS を乗っ取り、自前サーバに向ける | 攻撃者が任意の DID Document を返す → 偽の公開鍵で署名された VC が「正規」として検証されかねない |
| TLS 証明書の不正発行（rogue CA） | 同上 |
| 旧バージョン TLS / 弱い cipher を介した MITM | 同上 |
| civicship 内部の HTTPS サーバ侵害 | civicship 自身が改竄可能 |

#### `civicship.app` の現状（2026-05-09 計測）

ドメインは Cloudflare DNS、トラフィックは Google Cloud Load Balancer 経由（`34.8.190.174` → `googleusercontent.com`）。SSL Labs / Verisign DNSSEC Analyzer / crt.sh での実測結果:

| 項目 | 状態 | 評価 |
|---|---|---|
| HSTS header | ✅ `max-age=31536000; includeSubDomains; preload` | 優秀 |
| HSTS preload list 登録 | ✅ Chrome / Edge / Firefox / IE で preloaded | 優秀 |
| TLS 1.3 | ✅ サポート（`TLS_AES_256_GCM_SHA384` 等の強力な cipher） | 優秀 |
| TLS 1.2 | ✅ サポート（forward secrecy 付き） | 良 |
| **TLS 1.0 / 1.1** | ❌ **有効のまま** | **要無効化**（GCLB SSL policy が COMPATIBLE のため） |
| **TLS 1.2 内の弱 cipher** | ❌ 3DES / `TLS_RSA_*`（FS なし）/ CBC-SHA1 が enabled | **要無効化** |
| **OCSP stapling** | ❌ 未対応 | 推奨対応 |
| 証明書 | ✅ Google Trust Services (WR3)、90 日自動更新 | 優秀 |
| Forward Secrecy | ✅ ECDHE x25519 | 優秀 |
| HTTP/2 (h2) ALPN | ✅ | 良 |
| **SSL Labs Grade** | **B**（TLS 1.0/1.1 有効により capping） | **要対応で A 以上を目指す** |
| **DNSSEC** | ❌ DS / DNSKEY / RRSIG いずれも未設定 | **要対応** |
| **CAA レコード** | ❌ 未設定（Google / Cloudflare / Sectigo の混在発行履歴あり） | **要対応** |
| CT log の不審発行 | ✅ なし（合法 CA のみ） | 良 |

#### 緩和策（Phase 0 / 1 で対応）

**第 1 線: HTTPS インフラ強化（civicship.app 側の運用作業）**

優先度高（**did:web 信頼の根幹、Phase 0 で対応**）:

1. **GCLB SSL policy を MODERN プロファイルに変更**
   ```bash
   gcloud compute ssl-policies create civicship-modern-tls \
     --profile MODERN \
     --min-tls-version 1.2
   gcloud compute target-https-proxies update <PROXY_NAME> \
     --ssl-policy civicship-modern-tls
   ```
   → TLS 1.0/1.1 無効化、3DES / FS なし cipher 削除、SSL Labs grade A 以上を目指す

2. **DNSSEC 有効化** (Cloudflare Dashboard → DNS → DNSSEC → Enable → 表示される DS レコードを `.app` レジストラに登録)
   → 伝播 24-48h、`dig +dnssec civicship.app DS` で確認

3. **CAA レコード設定** (Cloudflare Dashboard → DNS → CAA Record)
   ```
   civicship.app. CAA 0 issue "pki.goog"
   civicship.app. CAA 0 issue "letsencrypt.org"
   civicship.app. CAA 0 iodef "mailto:info@hopin.co.jp"
   ```
   → 注意: Sectigo / Cloudflare 発行の既存サブドメイン証明書がある場合、それらも CAA に許可するか、サブドメイン別 CAA を切るか判断が必要

優先度中（Phase 1 で対応）:

4. OCSP stapling 有効化（GCLB Backend Service）
5. CT log の不審な発行アラート設定（Cert Spotter / Google Cert Transparency Monitoring）
6. ドメイン更新期限を 5-10 年以上前払いに設定
7. DNS / レジストラの管理者 MFA 強制

**第 2 線: chain anchor を活用した検出**

これが本設計の重要な強み: **HTTPS で取得した DID Document の hash が、Cardano 上の anchor と一致するか**を verifier が検証可能。

```
1. verifier が https://api.civicship.app/users/u_xyz/did.json を取得 → DID Document A
2. DID Document A の hash を計算 → H_A
3. Cardano metadata 1985 から該当 DID の最新 op を取得 → H_chain
4. H_A == H_chain なら正規、不一致なら DNS / TLS 乗っ取りの可能性
```

**監査人 / セキュリティ意識の高い verifier** には「chain anchor との整合確認」を推奨する運用。一般 verifier は HTTPS のみで運用（速度優先）。

→ これは `did:prism` には存在しない緩和策（`did:prism` は HTTPS を使わないので、そもそも DNS 攻撃面がない代わりに resolver の中央集権性に依存）。

#### Phase 0 受け入れ基準（civicship.app 側）

- [ ] DNSSEC: `dig +dnssec civicship.app DS` で DS レコード確認
- [ ] CAA: `dig CAA civicship.app +short` で許可 CA リスト確認
- [ ] SSL Labs: civicship.app が **A 以上** を取得
- [ ] HSTS preload: 維持（既に登録済み、変更時に外れないよう注意）

### 9.7 GDPR / 個人情報削除と chain 整合性（§N 対応）

#### 課題

`User.onDelete: Cascade` で `UserDidAnchor` 全行が削除されるが、**chain 上には永続的に残る** → DB の hash chain 切れ。さらに「削除される権利」（GDPR Art. 17）対応として個人情報を chain に書込むことが法的にグレー。

#### 対応方針

**chain には個人情報を直接書込まない**:

| chain に書く | 個人情報か? | 対応 |
|---|---|---|
| `did:web:api.civicship.app:users:u_xyz`（DID 文字列） | ⚠️ ID として PII になり得る | userId 自体は cuid（不可逆ハッシュ的） → PII 該当回避 |
| DID Document の hash | ❌ | 32B hash、復元不可 |
| Document CBOR 本体 | ⚠️ verificationMethod ありの場合は鍵が PII 該当する可能性 | §B 対応で **本文を含めない**（id のみ）→ 個人特定不可 |
| Transaction.id（leafIds） | ❌ | cuid のみ、内容は DB |
| VC JWT の hash | ❌ | hash のみ |

→ **本設計は chain 上に個人情報を直接記録しない**形で構成済み。GDPR の「削除される権利」は DB 側で完結（chain には PII でない hash / ID のみ残る）。

#### ユーザー削除時のフロー（DID DEACTIVATE → VC cascade revocation）

```
[User 削除リクエスト受領]
1. 該当ユーザーが Subject の VC を全て検索（VcIssuanceRequest.subject = user の did）
2. それら VC を一括 revoke（StatusList のビット立てを atomic で）
   ↑ ここが §4 cascade ロジック：DID DEACTIVATE と VC revoke は不可分
3. UserDidAnchor の DEACTIVATE op を発行（次回バッチで chain にも記録）
4. X 日経過（DEACTIVATE op が CONFIRMED、StatusList VC JWT 再署名 / 配信反映）
5. **論理削除フェーズ**: User に `deletedAt` / `deletedReason` をセット（PII 含む列を NULL/匿名化）
   - メールアドレス・名前等の PII カラムをマスク
   - UserDidAnchor / VcIssuanceRequest は **保持**（DEACTIVATE 履歴と revocation 状態が必要なため）
6. **物理削除フェーズ（X 日後）**: 監査ログ保管期間（例: 90 日）経過後、batch で物理削除
   - User 行を DELETE → FK CASCADE しないので、UserDidAnchor / VcIssuanceRequest を先に明示削除
   - 削除順: VcIssuanceRequest（FK あり）→ UserDidAnchor → User
7. chain 上には DEACTIVATE 履歴と VC anchor の root が残るが、PII 不在
   （hash と cuid の DID 文字列、VC 本体は DB から消えている）

→ §4.1 の `User` には `deletedAt DateTime?` / `deletedReason String?` を追加（既存 User スキーマの拡張）。物理削除 batch は `src/presentation/batch/userPhysicalDeletion/` で実装。
```

##### cascade 実装（`UserDeactivationUsecase`）

```ts
async deactivateUser(ctx, userId): Promise<void> {
  return await ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
    const did = `did:web:api.civicship.app:users:${userId}`;

    // (1)(2) VC を一括 revoke
    // 既存スキーマ: VcIssuanceRequest.userId が User と FK 関係を持つ（schema.prisma:527-528）
    // → userId で全 VC を引ける（subject DID は did:web:api.civicship.app:users:{userId} で導出可）
    const subjectVcs = await tx.vcIssuanceRequest.findMany({
      where: {
        userId,
        vcFormat: "INTERNAL_JWT",  // 内製化以降の VC のみ。IDENTUS_JWT は IDENTUS 側で管理されていたためスコープ外
        revokedAt: null,            // 未 revoke のみ対象
      },
    });
    for (const vc of subjectVcs) {
      if (vc.statusListIndex !== null && vc.statusListCredential) {
        await this.statusListService.revokeIndex(
          ctx,
          vc.statusListCredential,
          vc.statusListIndex,
          tx,
        );
        await tx.vcIssuanceRequest.update({
          where: { id: vc.id },
          data: { revokedAt: new Date(), revocationReason: "user_deactivated" },
        });
      }
    }

    // (3) DID DEACTIVATE op を発行
    await this.userDidAnchorRepo.create(ctx, {
      did,
      operation: "DEACTIVATE",
      // ...
    }, tx);
  });
}
```

→ 「DID 失効 ＋ VC 取り消し」は**不可分なトランザクション**として扱う。実装漏れ防止のため `usecase.ts` に集約。

→ §4.1 の `User.onDelete: Restrict` により Prisma は明示的に上記 workflow を要求する。

---

## 10. コスト試算

### 10.1 Blockfrost API
- 用途: (1) 週次 anchor の tx submit ＋ confirm polling、(2) `/anchor/:txHash/verify` 経由の chain 検証（実装した場合のみ）、(3) DID Document の `proof.anchorTxHash` 確認時のオプション検索
- API call 数:
  - **基礎運用**: 月 ~50-100 call（バッチ submit ＋ polling）
  - **検証者経由（§M 注意）**: もし `/anchor/:txHash/verify` で Blockfrost を proxy 経由すると、検証者数次第で 100-1000 倍に膨らむ可能性。Phase 2 で評価
  - 50,000 req/**日** 無料枠 = 月換算 1,500,000 req → 検証者 100 人/日が直接叩いても余裕
- 無料 STARTER プラン: 50,000 req/日 → **$0/月**

### 10.2 Cardano tx 手数料
- 1 tx ≒ 0.17 ADA = ~$0.07-0.10
- 週次バッチ 4 tx/月 + 操作多い週で +1 tx/週 → 月 6-8 tx
- **月 ~$0.50**
- Issuer wallet ADA float: 50 ADA で 200+ 週分

### 10.3 GCP KMS
- 非対称鍵 1 個: $0.06/月
- 署名 API: $0.03/10,000 ops
- VC 1 万件/月 + バッチ署名 → **月 ~$0.10**

### 10.4 DID Document HTTPS 配信
- 既存 civicship-api インフラに乗る → 追加コストなし

### 10.5 Backfill コスト（一回限り）

§11 Phase 3 で実施する **1000 ユーザー DID** の初回 backfill:

| 項目 | 値 |
|---|---|
| 戦略 | doc hash のみを chain、doc 本体は HTTPS（§7.4 参照） |
| tx 数 | **~13 tx**（80 op/tx × 13 ≒ 1000） |
| Cardano 手数料 | ~2.2 ADA ≒ **~$1** |
| Blockfrost API 消費 | ~65 call（無料枠の 0.1%、問題なし） |
| 必要日数 | **1-2 日**（連続 submit、エラー時のリトライバッファを取る） |

加えて Transaction の初期 Merkle anchor は **1 tx で ~5000 件集約可能**（leafIds は metadata 外の DB に保持、root のみ 32 byte chain 書込）→ ~$0.08。

backfill 月のみ ~$1 加算、それ以降は通常運用コストに戻る。

### 10.6 合計

#### 金額面

| 項目 | 月額 |
|---|---|
| Blockfrost | $0 |
| Cardano tx 手数料 | ~$0.50 |
| GCP KMS | ~$0.10 |
| その他（GCS, ロギング等） | ~$0.10 |
| **合計** | **~$1/月** |

旧 IDENTUS 運用（VM ＋ Cardano フルノード）と比較して **大幅削減**。

#### 運用工数（§K 対応：「ゼロ」ではない、現実値を明示）

「運用工数ゼロ」は誤解を招くため訂正。**実運用で必要な最小タスク**:

| タスク | 頻度 | 想定工数 |
|---|---|---|
| ADA 残高確認 / 補充 | 年 1-2 回 | 30 分/回 |
| KMS 鍵ローテーション（§9.1.2 24h overlap） | 年 1 回 | 2-3 時間（含む実 tx 検証） |
| Blockfrost API key ローテ | 年 1 回 | 30 分 |
| HSTS preload 維持確認 | 年 1 回 | 10 分 |
| CAA / DNSSEC 設定確認 | 半年 1 回 | 30 分 |
| CT log 監視 / 不審発行アラート対応 | 月 1 回（チェック） | 10 分/回（通常時） |
| Cardano Hard Fork 対応（§P） | 1-2 年に 1 回 | 1-2 日（CSL/SDK 更新、preprod テスト含む） |
| Blockfrost / Cardano 障害対応 | 年 1-2 回 | 数時間/回 |

→ **年間想定: 20-30 時間程度**。これは旧 IDENTUS の「VM ディスク管理 ＋ プロセス再起動 ＋ チェーン同期エラー対応 ＋ 障害復旧」の年間数十時間 + 運用負債と比べて圧倒的に少ないが、ゼロではない。監査時に「運用ゼロ」と言うと事実誤認となる。

---

## 11. 段階的リリース

### Phase 0: PoC（1 週間）

実装着手前に **必ず preprod / localhost で検証する 6 項目**:

| # | 検証内容 | 失敗時の影響 |
|---|---|---|
| **0-1** | Cardano preprod で Blockfrost 経由 tx submit → Cardanoscan 等の explorer で metadata 1985 を確認 | submit パス全体が動かない |
| **0-2** | KMS Ed25519 で Cardano tx 署名と VC JWT 署名の両用検証（§I 対応：詳細項目）。**preprod で実 tx を 1 件出して**:<br/>(a) KMS Ed25519 が **PureEdDSA (no pre-hash)** 仕様か（RFC 8032 §5.1.6、Cardano は pre-hash しない）<br/>(b) `asymmetricSign` payload 上限（数 KB）に Cardano tx body hash (32B) が収まるか<br/>(c) KMS が返す署名が **64 byte raw** か（CSL の `Vkeywitness::new(vkey, ed25519_signature)` で受け取れる形式）<br/>(d) `did-jwt` の `Signer` interface に KMS sign を inject 可能か（JOSE 形式と raw 形式の変換）<br/>→ 1 つでも不整合があれば設計大幅やり直し | wallet 鍵管理の前提が崩れる |
| **0-3** | `did:web:api.civicship.app:users:u_xyz` の DID Document を localhost HTTPS で配信 → 標準 did:web resolver（Veramo / web-did-resolver）で解決確認 | did:web 構文の最終確認 |
| **0-4** | 第三者検証スクリプト（civicship 非依存 / Blockfrost 不使用、Cardano explorer 経由のみ）で end-to-end 検証 | 「Cardano explorer で確認」運用が成立しない |
| **0-5** | GIN index 込みの schema migration を localhost PostgreSQL で実走 → `EXPLAIN ANALYZE` で `&&` 検索が GIN index 使用していることを確認 | `/point/verify` が線形スキャンで遅い |
| ~~0-6~~ | ~~metadata label 1985 が CIP-10 で衝突していないこと~~ → **完了 (2026-05-09): CIP-10 registry で 1985 未登録を確認済**（46 登録済の中になし、近隣 1983/1984/1988/1989 は使用中、1985 のみ空き） | — |

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
- [ ] **Q13: KMS 鍵リング `civicship-issuer` を `global` location で作成可能か、GCP プロジェクト権限を確認**（§9.1.5、リージョン障害耐性のため必須）
- [ ] PoC 用コードは throwaway として明記（Phase 1 で書き直す前提）

### Phase 1: 内製発行（フラグ OFF 配置、2 週間）

- 全コード（DID 発行・VC 発行・anchor バッチ・/point/verify 新版）を main にマージ
- feature flag `INTERNAL_DID_VC_ENABLED=false`、本番では既存 IDENTUS 経路を維持
- preprod 環境で完全な E2E 動作を確認

### Phase 2: 影 dual-write（1 週間）

- 本番で `INTERNAL_DID_VC_ENABLED=true`（DID/VC は IDENTUS と内製の両方で発行、内製は表示には使わない）
- /point/verify は新版 SQL 経路に切替（既に互換性あり）
- 1 週間運用してエラーログ確認

### Phase 3: 内製カットオーバー（1-2 日）

ユーザー数 ~1000 のため、DID backfill は **~13 tx で完了** する。

**Day 1**:
- 全 ~1000 ユーザーの **DB 上の `DidIssuanceRequest` 行**を `INTERNAL` で一括 INSERT（DB 操作のみ、chain 不問）
- 全ユーザーの DID Document を `api.civicship.app` の Express router で HTTPS 配信開始（`src/presentation/router/did.ts`、§5.4.1）
- Transaction の Merkle anchor を **1 tx で backfill submit**（leafIds は DB に保持、root のみ chain）
- DID 操作の chain backfill（doc hash のみ）を **~13 tx 連続 submit**
  - tx 間隔 5-10 分（Cardano confirm 待機）
  - 各 tx confirm 後に該当 UserDidAnchor を CONFIRMED 更新
- UI 側で `did:web:...` 表示に切替（DID Issuance Request の最新行が INTERNAL になる）

**Day 2**:
- 全 UserDidAnchor が CONFIRMED であることを確認
- 第三者検証スクリプトで end-to-end 確認（Cardano explorer 経由）
- IDENTUS 経路を OFF

**ロールバックポイント**: Day 1 で IDENTUS OFF にせず維持しているため、Day 2 までは feature flag OFF で IDENTUS 経路に戻せる。

**コスト**: backfill 全体で **~$1**（§10.5 参照）。

### Phase 4: IDENTUS 撤去（次スプリント以降）

- `requestDIDVC` / `syncDIDVC` バッチ、`DIDVCServerClient`、IDENTUS 系 client コードを削除
- env 変数 `IDENTUS_API_URL` / `IDENTUS_API_KEY` / `IDENTUS_API_SALT` を削除
- `identus-cloud-agent-vm` をシャットダウン → コスト削減確認

### ロールバック

- Phase 3 までは feature flag OFF で IDENTUS 経路に戻せる
- Phase 4 以降のロールバックは不可（IDENTUS 撤去後）→ Phase 3 の 1 週間で十分検証してから進む

### 継続運用 SOP: Cardano Hard Fork 対応（§P 対応）

Cardano は 1-2 年に 1 回 hard fork が来る（Vasil → Conway → ...）。**事前告知あり**なので計画的に対応:

| 時期 | アクション |
|---|---|
| HF 告知（fork 6 ヶ月前） | リリースノート確認、CSL / Blockfrost SDK の対応版確認 |
| 4 ヶ月前 | preprod で新 era のテスト（CSL アップグレード版で tx 構築・submit） |
| 2 ヶ月前 | mainnet 移行までに本番コードを更新版にデプロイ（feature flag で旧版に戻せる状態） |
| HF 当日 | preprod 監視、エラー時は緊急対応 |
| HF 後 1 週間 | weekly batch が正常動作することを確認、問題なければ feature flag OFF |

**メタデータ format の互換性**: label 1985 や op 構造は CIP-20 の枠を超えない範囲で運用。新 era で metadata 仕様変更があれば schema version (`v: 1` → `v: 2`) で吸収。

---

## 12. テスト戦略

### 12.1 ユニット
- `kmsSigner`: KMS をモック、署名ペイロード一致を確認
- `userDidBuilder`: `userId` から決定論的に DID 文字列が組み立てられること（純粋関数、§B 対応）
- `merkleTreeBuilder`: leaf 集合 → root 計算、proof 検証
- `txBuilder`: metadata 1985 のサイズ計算、CBOR エンコード結果のバイト一致、64B chunking
- `statusListService`: VC index 予約 (CAS)、ビット立て、bitstring 圧縮の往復
- `userDidAnchorRepo`: 楽観ロック (version CAS) の競合検出

### 12.2 統合
- VC 発行〜DB 保存〜JWT 検証〜DID Document 解決の E2E
- Cardano preprod 実環境で submit→confirm→verify の全周
- **Transaction backfill ~5,000 件のドライラン**（実 Tx は出さず Merkle root 計算のみ、§1.0 参照）
- **DID backfill ~1,000 ユーザーのドライラン**（13 tx 程度に分割可能か実測、§7.4 参照）
- **VC backfill のドライラン**（既発行の IDENTUS_JWT VC を新方式 anchor に取り込めるか、§A 対応）
- VC 発行 → 次回 batch で anchor → revocation → 検証の E2E

### 12.3 互換性
- 既存 `vcIssuanceRequests` GraphQL クエリの返却形が変わっていないことを既存テストで確認
- 既存 IDENTUS データのレコードが `vcFormat=IDENTUS_JWT` で読めること
- `/point/verify` レスポンスが既存形式と完全一致すること
- 標準 did:web resolver（Veramo / web-did-resolver / Microsoft Resolver）で `did:web:api.civicship.app:users:u_xyz` が解決可能

### 12.4 性能・負荷（§O 対応：従来欠けていた領域）
- **GIN index 性能**: `t_transaction_anchors.leaf_ids` に 100 行 × 各 5,000 件 leaf を入れて `&&` 検索のレイテンシ実測（GIN なし時との比較）
- **metadata 16KB 境界値**: 1 op = 800B 想定で 20 op を超える場合の自動分割が正しく動くか
- **/point/verify 大量バッチ**: 10,000 txIds 同時問い合わせ時のレスポンス時間
- **DID Document 配信のレイテンシ**: 1,000 同時アクセスで p99 < 200ms が維持できるか

### 12.5 Chaos / 障害注入（§O 対応）
- **Blockfrost ダウン**: tx submit が失敗した時のリトライ動作（次回バッチへの繰越が機能するか）
- **KMS 一時不能**: 5xx 返却時の VC 発行のリトライ動作
- **ADA 残高ゼロ**: tx submit が `InsufficientCollateralFunds` 系エラーで失敗した時の Slack 通知 + 状態保持
- **Cardano confirm 遅延**: confirmation timeout 設定の上限を超えた時の挙動（FAILED 遷移 vs 待機継続）
- **DB 並行更新**: 同 DID への UPDATE が競合した時の version CAS 失敗 → リトライ or 例外

---

## 13. オープンクエスチョン

| # | 内容 | 状態 |
|---|---|---|
| ~~Q0~~ | ~~Cardano にアンカしているのが外向きの約束か~~ → **クローズ: 助成金条件で確定** | ✅ クローズ |
| ~~Q1~~ | ~~`/point/verify` の現実の呼び出し元と使用頻度~~ → **クローズ: `TransactionVerificationService` 単独。Transaction Merkle 検証専用** | ✅ クローズ |
| ~~Q2~~ | ~~Issuer DID のドメインは civicship.app でよいか~~ → **クローズ: `did:web:api.civicship.app` で確定**。civicship-api で完結（Express router で実装）、Next.js フロントエンド非依存 | ✅ クローズ |
| ~~Q3~~ | ~~既発行 IDENTUS DID/VC の表示用 UI~~ → **クローズ: `DidIssuanceRequest` 最新行が `INTERNAL` になることで自動的に新表示**。旧行は履歴として保持 | ✅ クローズ |
| ~~Q4~~ | ~~アンカリング粒度（1h vs 24h vs 件数閾値）~~ → **クローズ: 週次バッチ。Transaction Merkle root バックフィルは 1 tx に集約、DID backfill は ~13 tx（1000 ユーザー / 80 op/tx）に分割（§7.4 / §11 Phase 3 参照）** | ✅ クローズ |
| ~~Q5~~ | ~~Solana 過去ネットワーク停止リスクのバックアップ~~ → **クローズ: Cardano 単独で確定（助成金条件）** | ✅ クローズ |
| Q6 | 独自 cryptosuite `civicship-merkle-anchor-2026` の仕様書を `docs/specs/` に公開 → 必要なら W3C registry 登録、CIP 提案 | 後回し可（Cardano explorer ベース運用なら影響なし） |
| ~~Q7~~ | ~~User DID 秘密鍵の保管方法~~ → **クローズ: §B 対応で User 鍵自体を生成しない。platform-issued + VP なしのため verificationMethod ごと省略（§5.1.3, §9.1）** | ✅ クローズ |
| ~~Q8~~ | ~~DID 鍵ローテのトリガー~~ → **クローズ (Issuer 鍵)**: §G 対応で 24h 並行運用、年次自動＋漏洩検知時の 2 系統。User 鍵は不存在（Q7） | ✅ クローズ |
| ~~Q9~~ | ~~metadata label の最終確定~~ → **クローズ: CIP-10 registry.json (2026-05-09 取得) で label 1985 が未登録であることを確認済** | ✅ クローズ |
| Q10 | DID Document の chain 格納戦略（doc 込み or hash のみ）の運用後判断 | backfill は hash のみ（§7.4）、新規発行は doc 込み採用。運用 6 ヶ月後に metadata サイズ・コストを評価して見直し |
| Q11 | StatusList 自体の Cardano anchoring | Phase 2 後検討（§7.5 参照）。当面は HTTPS のみで配信 |
| Q12 | EU ユーザー対応時の GDPR 削除フロー実装 | §9.7 で枠組み記述、Phase 4 後の独立タスク |
| Q13 | KMS 鍵を `global` location で運用するための GCP プロジェクト権限確認 | Phase 0 タスク |

---

## 14. 受け入れチェックリスト

### 14.1 基礎機能
- [ ] Phase 0 PoC で第三者検証スクリプトが pass する（civicship 非依存で chain だけから DID/VC を検証可能）
- [ ] Cardano explorer で metadata label 1985 を見ると `tx.root` / `vc.root` / `ops[]` が読める形で表示される
- [ ] Phase 1 で全コードが main にマージされ、feature flag OFF で既存運用と完全互換
- [ ] Phase 2 影 dual-write で 7 日間エラーゼロ
- [ ] Phase 3 cutover で全 ~1000 ユーザーの DID 表示が `did:web:...` に切替
- [ ] Phase 3 で旧 5,000 件 Transaction の anchor が CONFIRMED
- [ ] `/point/verify` が IDENTUS API を一切呼ばずに動作
- [ ] 月額運用コストが $5 以下を 1 ヶ月維持
- [ ] Phase 4 で `identus-cloud-agent-vm` がシャットダウン済み
- [ ] 第三者監査資料として「Cardano explorer で全 DID/VC が検証可能」のドキュメントを公開

### 14.2 新規スコープのテスト（§A〜§D 対応分）
- [ ] **VC anchoring**: 新規 VC が次回バッチで anchor され `vcAnchorId` / `anchorLeafIndex` が埋まる
- [ ] **VC inclusion proof**: `/vc/:vcId/inclusion-proof` が proof を返し、ローカル検証で root 一致
- [ ] **VC revocation**: `revokeVc` API → StatusList VC が再署名 → `/status/list/:key` で revoked bit が反映 → verifier で revoked 判定
- [ ] **DID Tombstone**: DEACTIVATE 後の DID が `{deactivated: true}` で 200 を返す
- [ ] **PENDING DID 配信**: 新規 DID 発行直後（anchor 前）でも `/users/:id/did.json` が 200 で `proof.anchorStatus: "pending"` を返す
- [ ] **Issuer 鍵ローテ 24h overlap**: 旧鍵で署名された VC が新鍵に切替後も検証可能
- [ ] **DID DEACTIVATE → VC cascade revocation**: ユーザー削除時に該当 VC が自動的に revoke される
- [ ] **idempotency**: バッチ submit 中の crash 後、再起動時に同じ batchId で復旧して二重 anchor が起きない

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

§J 対応：**日常検証は HTTPS 単独**、**監査検証は HTTPS ＋ chain** の 2 段構えを明示する。

### 付録 B.1 日常検証（軽量、ms オーダー）

verifier が「VC が真正か」を素早く確認したいケース。**Cardano chain は触らない**:

```
1. VC JWT を受領
2. JWT デコード → header.kid から Issuer DID を取得 = "did:web:api.civicship.app#key-N"
3. https://api.civicship.app/.well-known/did.json を HTTPS GET
   → Issuer DID Document の verificationMethod[#key-N] を取得
4. JWT 署名を Issuer 公開鍵で検証 → OK
5. credentialStatus.statusListCredential を fetch（§D）
   → bitstring の statusListIndex bit が 0 なら not revoked
6. 結果 → VC は真正、未失効
```

→ civicship.app の HTTPS 信頼に乗る。**検証時間 ~100ms**。一般 verifier はここまで。

### 付録 B.2 監査検証（chain で改ざん不能性まで確認）

監査人 / セキュリティ意識の高い verifier 向け。HTTPS で取得した内容が **chain の anchor と整合するか** まで確認:

```
[B.1 を実施した上で、追加で:]

7. Subject DID Document を https://api.civicship.app/users/u_xyz/did.json で取得
   → proof: { anchorTxHash, opIndexInTx, docHash, anchorStatus: "confirmed" }
   注: §C 対応で proof は Merkle proof ではなく op 直接参照（anchor 済 DID 操作は metadata に直接乗る）
8. Cardano explorer (cardanoscan.io / cexplorer.io / pool.pm 等) で proof.anchorTxHash を開く
   → metadata label 1985 を表示
   → ops[opIndexInTx].h == proof.docHash → 一致 OK（DID 操作の改ざん不能性確認）
9. VC の anchor も chain で確認したい場合（VC inclusion proof、§A 対応）:
   - **civicship-api の inclusion-proof API を呼ぶ**:
     `GET https://api.civicship.app/vc/{vcId}/inclusion-proof`
     → 返却: `{ leafHash, leafIndex, siblings[], root, chainTxHash }`
   - ローカルで Merkle 検証ライブラリで root を再構築（leafHash + siblings）
   - Cardano explorer で `chainTxHash` の metadata 1985 を開く → `vc.root` を確認
   - root が一致 → VC は確かに anchor 済 → OK
10. すべて整合 → VC は真正、改ざん不能性も確認

注: chain 単独で全 anchor をスキャンする方法（B.3）は 5 年運用後に数百 tx の brute force が要るため非実用。**通常の監査では inclusion-proof API を使う**（§J 対応）。

検証で触れたインフラ（civicship 非依存性）:
  - api.civicship.app (HTTPS) ← 1 次解決のみ
  - cardanoscan.io 等 ← Cardano 公開チェーンの explorer（複数独立運営）
  - 検証コード ← did:web resolver / Blake2b / Merkle 検証 ライブラリのみ
```

→ **検証時間 数秒〜10秒**（explorer の表示確認込み）。年次監査・重要 VC の確認時のみ。

### 付録 B.3 chain 単独検証（civicship.app 消失時）

§J で議論したスケーラビリティ問題: **5 年運用後の chain スキャンは非実用的**。
api.civicship.app が消失した時の緊急 fallback として、Cardano metadata 1985 を時系列スキャンして DID 履歴を再構築する手順は §8.3 に記載。**ただし高頻度には適さない**ため、平常運用では B.1 / B.2 を使う。

これにより、**特定ベンダ（IOG / civicship 自身）への信頼に依存せず、Cardano チェーンと W3C 標準仕様だけで検証完結**する設計になっている（trust requirement の段階的な強化）。
