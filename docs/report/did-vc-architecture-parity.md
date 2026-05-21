# DID/VC アーキテクチャ移行 — 機能パリティ説明書

IDENTUS を前提とした旧アーキテクチャから、内製アーキテクチャへの移行が
**「機能的に差分ゼロ」** であることを、図と表で示すドキュメント。

> **このドキュメントの位置づけ**
> 変わったのは *実装* だけで、ユーザー / 連携先 / 第三者から見た *機能* は
> 等価である。むしろ「第三者検証可能性」と「運用コスト」では旧方式を上回る。
> 設計の正本は [`did-vc-internalization.md`](./did-vc-internalization.md)
> （~2,400 行）であり、本書はその「移行が等価であること」を一望するための
> 要約図解である。

---

## 0. 移行のゴール

> 既存の **IDENTUS ありき** のアーキテクチャと、**内製化後** のアーキテクチャの
> 間に、**機能的な差分が無い** こと。

「差分が無い」の定義は次の 3 点に分解できる:

1. **対外的な振る舞いが同じ** — GraphQL schema、`/point/verify` のレスポンス形、
   DID/VC の発行・失効・検証という機能セットが維持される。
2. **データの意味が同じ** — DID 操作履歴・VC・Merkle anchor が引き続き
   Cardano 上に記録され、追跡可能性を失わない。
3. **破壊的変更ゼロ** — 既存テーブル・enum・API を壊さない。

以降、この 3 点が満たされていることを図・表で確認する。

---

## 1. アーキテクチャ図 — Before / After

### 1.1 旧: IDENTUS 前提アーキテクチャ

```mermaid
flowchart LR
    Client["クライアント / 管理者"]
    Verifier["第三者検証者"]

    subgraph civicship["civicship 管理"]
        API["civicship-api"]
        DB[("PostgreSQL")]
    end

    subgraph identus["IDENTUS（外部依存・有償 VM）"]
        Agent["IDENTUS Cloud Agent<br/>DID 発行・解決<br/>VC 発行・失効"]
    end

    Cardano[("Cardano")]

    Client -->|GraphQL| API
    API -->|requestDIDVC バッチ| Agent
    API -->|"/point/verify は HTTP 呼出"| Agent
    API --> DB
    Agent -->|"did:prism 管理"| Cardano
    Verifier -.->|"検証不可（IDENTUS 内部に隠蔽）"| Agent
```

**特徴**: DID・VC・失効・Cardano 書込の中核が外部 IDENTUS に存在し、
civicship からは不透明。第三者は IDENTUS を信頼するしか検証手段が無い。

### 1.2 新: 内製アーキテクチャ

```mermaid
flowchart LR
    Client["クライアント / 管理者"]
    Verifier["第三者検証者"]

    subgraph civicship["civicship 管理（自前・完結）"]
        API["civicship-api"]
        Router["DID/VC ルーター<br/>/.well-known/did.json<br/>/users/:id/did.json<br/>/vc/:id/inclusion-proof<br/>/status/list/:key"]
        Batch["AnchorBatch（週次）"]
        DB[("PostgreSQL<br/>anchors / leaf_ids")]
    end

    KMS["Cloud KMS<br/>Ed25519 署名鍵"]
    Blockfrost["Blockfrost API"]
    Cardano[("Cardano")]

    Client -->|GraphQL mutation| API
    API -->|VC 署名| KMS
    API --> DB
    Router --> DB
    Batch --> DB
    Batch -->|metadata 1985 submit| Blockfrost --> Cardano
    Verifier -->|HTTPS GET| Router
    Verifier -->|explorer / Koios| Cardano
```

**特徴**: DID・VC・失効・Cardano 書込のすべてが civicship 内に閉じる。
外部依存は「汎用 Cardano ノード API（Blockfrost）」と「鍵保管庫（KMS）」のみで、
いずれも IDENTUS のようなドメイン固有のブラックボックスではない。

---

## 2. コンポーネント対応表（1:1 マッピング）

旧アーキテクチャの各機能は、新アーキテクチャの具体的な実装に **過不足なく**
対応する。「消えた機能」も「代替の無い欠落」も無い。

| 機能領域 | 旧（IDENTUS） | 新（内製） | 等価性 |
|---|---|---|:---:|
| DID 方式 | `did:prism:<不透明文字列>` | `did:web:api.civicship.app:users:<cuid>` | ✅ |
| DID 発行トリガ | `requestDIDVC` バッチ → IDENTUS 非同期ジョブ | GraphQL mutation（同期）/ backfill スクリプト | ✅ |
| DID Document 配信 | IDENTUS Cloud Agent | civicship-api Express ルーター | ✅ |
| DID 操作履歴 | PRISM 内部管理 | Cardano metadata 1985 `ops[]` | ✅ |
| VC フォーマット | `IDENTUS_VC_PRISM`（IDENTUS 専用 JWT） | `INTERNAL_JWT`（W3C VC JWT） | ✅ |
| VC 署名鍵 | IDENTUS 管理鍵 | Cloud KMS Ed25519 | ✅ |
| VC 失効 | IDENTUS revocation list | W3C Bitstring Status List 2021 | ✅ |
| Merkle root の Cardano 書込 | civicship が計算 → IDENTUS が書込 | civicship が Blockfrost 経由で直接書込 | ✅ |
| `/point/verify` | IDENTUS API への HTTP 呼出 | ローカル DB（`t_transaction_anchors.leaf_ids` GIN index）参照 | ✅ |
| 第三者検証 | 不可能（IDENTUS 内部に隠蔽） | Cardano explorer + HTTPS GET で完結 | ✅ 向上 |
| 運用コスト | IDENTUS VM（月額 $数十） | Blockfrost + KMS（月額 ~$1） | ✅ 向上 |
| GraphQL schema | `DidIssuanceRequest` / `VcIssuanceRequest` | 同 shape を維持（enum で内製/legacy 区別） | ✅ |

---

## 3. 主要フロー別 — Before / After

### 3.1 DID 発行とアンカリング

| | 旧（IDENTUS） | 新（内製） |
|---|---|---|
| 発行 | `requestDIDVC` バッチが IDENTUS に非同期依頼 | GraphQL mutation で `DidIssuanceRequest(INTERNAL)` + `UserDidAnchor(PENDING)` を即時 INSERT |
| chain 記録 | IDENTUS が `did:prism` 操作を Cardano に記録 | 週次 `AnchorBatch` が `UserDidAnchor` を metadata 1985 `ops[]` として submit |
| 結果 | DID 操作が Cardano 上に存在 | DID 操作が Cardano 上に存在（**同じ**） |

新フローのシーケンス:

```mermaid
sequenceDiagram
    participant C as クライアント
    participant API as civicship-api
    participant DB as PostgreSQL
    participant B as AnchorBatch（週次）
    participant CH as Cardano

    C->>API: DID 発行（GraphQL mutation）
    API->>DB: DidIssuanceRequest(INTERNAL, did:web) INSERT
    API->>DB: UserDidAnchor(CREATE, PENDING) INSERT
    API-->>C: did:web:... を即時返却
    Note over B: 週次バッチ起動
    B->>DB: PENDING な anchor を収集
    B->>CH: metadata 1985 ops[] を submit
    CH-->>B: tx CONFIRMED
    B->>DB: status=CONFIRMED / chainTxHash / chainOpIndex を書戻し
```

### 3.2 VC 発行・失効

| | 旧（IDENTUS） | 新（内製） |
|---|---|---|
| 発行 | IDENTUS が VC（`IDENTUS_VC_PRISM`）を発行 | `VcIssuanceService.issueVc` → `KmsJwtSigner` が W3C VC JWT を署名 |
| 署名鍵 | IDENTUS 管理鍵 | Cloud KMS Ed25519（civicship が鍵リング所有） |
| 失効 | IDENTUS revocation list | W3C Bitstring Status List 2021（`/status/list/:key` で配信） |
| 結果 | 標準的な検証可能クレデンシャル | 標準的な検証可能クレデンシャル（**W3C 準拠でより標準的**） |

### 3.3 第三者検証

ここが最も「機能向上」した領域。旧方式では検証は不可能だったが、新方式では
civicship を信頼せずに検証が完結する。

```mermaid
sequenceDiagram
    participant V as 第三者検証者
    participant R as civicship-api ルーター
    participant CH as Cardano（explorer / Koios）

    V->>R: GET /users/:id/did.json
    R-->>V: DID Document + proof（anchorTxHash / chainOpIndex / docHash）
    V->>CH: 当該 tx の metadata 1985 を取得
    CH-->>V: ops[chainOpIndex]
    V->>V: ops[chainOpIndex].h == docHash を照合
    Note over V: civicship を信頼せず検証完了
```

検証スクリプト [`scripts/verify-from-chain.ts`](../../scripts/verify-from-chain.ts)
が civicship のコードに一切依存せず（Koios + Blake2b のみ）この検証を実演する。

### 3.4 `/point/verify`

| | 旧（IDENTUS） | 新（内製） |
|---|---|---|
| 実装 | IDENTUS API への外部 HTTP 呼出 | ローカル DB `t_transaction_anchors.leaf_ids` への GIN index overlap クエリ |
| レスポンス形 | `{ txId, status, transactionHash, rootHash, label }` | **同一**（変更なし） |
| 外部依存 | あり（IDENTUS 稼働必須） | なし（DB のみ） |

レスポンス形が完全に同一のため、`/point/verify` の呼び出し側から見た差分はゼロ。

---

## 4. 「機能差分ゼロ」の根拠

### 4.1 成功基準（設計書 §1.3）— 全 7 項目達成

| # | 基準 | 達成 |
|---|---|:---:|
| 1 | `/point/verify` が外部 HTTP ゼロ・ローカル DB 参照のみで応答 | ✅ |
| 2 | 新規 DID/VC が IDENTUS API を一切呼ばずに発行される | ✅ |
| 3 | 第三者が Cardano explorer + HTTPS GET だけで独立検証できる | ✅ |
| 4 | DID 鍵ローテ・deactivate が Cardano 上に追跡可能な履歴として残る | ✅ |
| 5 | 月額運用コスト ≤ $5/月 | ✅（~$1/月） |
| 6 | 既存 GraphQL schema への破壊的変更ゼロ | ✅ |
| 7 | `/point/verify` のレスポンス形を維持 | ✅ |

### 4.2 非ゴール（＝壊していないこと）の維持

| 非ゴール | 維持 |
|---|:---:|
| 既発行 `did:prism:...` を書き換えない（履歴として残置） | ✅ |
| 既存テーブルへの破壊的スキーマ変更なし（全カラム NULL 許容 / default 付き追加） | ✅ |
| `EvaluationCredential` データモデル変更なし | ✅ |
| platform-issued DID を維持（self-sovereign 化しない） | ✅ |

### 4.3 互換性の担保

- GraphQL の `DidIssuanceRequest` / `VcIssuanceRequest` 型・enum は shape を維持。
- legacy enum `IDENTUS_VC_PRISM` は public API breaking change 回避のため残置。
- 旧 `did:prism` 行は削除せず履歴として保持し、新規 `INTERNAL` 行を別途追加。

→ 連携先・既存クライアントは **コード変更なし** で動作し続ける。

---

## 5. 差分ゼロを超えて — 内製化で「向上」した点

「機能的に同じ」が目標だったが、副次的に次が改善された:

| 観点 | 改善内容 |
|---|---|
| 第三者検証可能性 | 旧: 不可能 → 新: explorer + HTTPS GET で誰でも独立検証可能 |
| 運用コスト | 旧: 月額 $数十（IDENTUS VM） → 新: 月額 ~$1（Blockfrost + KMS） |
| 標準準拠 | 独自 `did:prism` / IDENTUS JWT → W3C `did:web` / W3C VC JWT / Bitstring Status List 2021 |
| 障害点 | IDENTUS VM という単一障害点を撤去。外部依存は汎用 API のみ |
| 透明性 | DID/VC ロジックが civicship リポジトリ内に可視化（ブラックボックス解消） |

---

## 6. データの正本（source of truth）の移動

機能は等価でも「データがどこに正本として在るか」は移動した。これは
*隠蔽から公開への移動* であり、追跡可能性を強化する方向の変化である。

| データ | 旧の正本 | 新の正本 |
|---|---|---|
| DID Document | IDENTUS 内部 | civicship DB（+ ルーターが動的生成） |
| DID 操作履歴 | PRISM 内部 | `t_user_did_anchors` + Cardano metadata 1985 |
| VC | IDENTUS 内部 | `t_vc_issuance_requests` + Cardano Merkle anchor |
| 失効状態 | IDENTUS revocation list | `t_status_lists`（+ `/status/list/:key` 配信） |
| Transaction anchor | civicship 計算 → IDENTUS 経由で chain | `t_transaction_anchors` + Cardano（civicship が直接） |

---

## 7. 関連ドキュメント

- 設計の正本: [`did-vc-internalization.md`](./did-vc-internalization.md)
- 移行の完了記録（PR 一覧・実行結果）: [`internalization-completion-2026-05.md`](./internalization-completion-2026-05.md)
- 運用 runbook:
  [`issuer-did-key-rotation.md`](../runbooks/issuer-did-key-rotation.md) /
  [`blockfrost-api-key-rotation.md`](../runbooks/blockfrost-api-key-rotation.md)
- 運用 checklist: [`anchor-batch-deploy-checklist.md`](../operations/anchor-batch-deploy-checklist.md)
- 第三者検証スクリプト: [`scripts/verify-from-chain.ts`](../../scripts/verify-from-chain.ts)
