# 緊急対応: CSV + 電話番号認証 NFTミント設計書

## 背景と目的

NFTは不可逆なリソースであり、後からの修正・回収が困難である。電話番号認証を起点とした暫定的な本人性のもとでウォレット作成・NFT割当が発生するため、「ユーザーが確定していない状態」を明示的に扱い、検証・確認・後追い対応が可能な運用フローを構築する。

---

## 基本方針

- NFTの正は **外部（MintService / ブロックチェーン）**
- Civicshipは NFTを **管理せず、参照のみ**
- Civicshipが内部で扱うのは以下に限定:
  - 電話番号認証によるJWT
  - ウォレットアドレス
  - ユーザー状態（確定 / 未確定）

---

## 元CSV（ミント起点データ）

### CSVの位置づけ

- ウォレットアドレス作成およびNFTミントの **唯一の入力ソース**
- 検証・運用目的で人が確認可能なデータとして用意される

### CSVカラム定義（確定）

| 列名 | 内容 | 役割 |
|------|------|------|
| `phoneNumber` | ユーザーの電話番号 | 電話番号認証・JWT発行に使用 |
| `nftSequence` | NFTの連番（sequence） | MintService側でNFTを識別 |
| `name` | ユーザー名（検証用） | 人手確認・照合用 |

### 「name」列の扱い（重要）

- `name` は **ユーザー名を表す**
- **検証・確認用途のみ** に存在する
- CivicshipのユーザーデータとしてはDB保存しない
- 出力CSV・外部APIには **永続化・転送しない**

> あくまで「この電話番号・NFT番号が誰を指しているかを人が確認するための補助情報」

---

## 認証およびウォレット作成フロー

### 認証方式

1. 元CSVの `phoneNumber` を用いて電話番号認証を行う
2. 認証結果としてJWTを取得する
3. JWTから Firebase UID を取得する

### 電話番号 → Firebase UID 解決フロー

```
電話番号 → 電話番号認証 → JWT → Firebase UID → ウォレット作成
```

> 外部には Firebase UID だけを使い、電話番号は CSV とスクリプト内に閉じ込める

### ウォレット作成条件

以下を満たす場合、ウォレットアドレス作成を行う:

- `phoneNumber` が存在する
- 電話番号認証によりJWTが取得できる

ユーザー状態は以下を許容する:
- ユーザー未登録
- ユーザー未確定（電話番号のみ）

### 「確定/未確定」の判定

Civicshipでは `Identity.refreshToken` の有無で判定:

| 状態 | 条件 |
|------|------|
| 確定 | `Identity.refreshToken` が存在する |
| 未確定 | `Identity.refreshToken` が `null` |

---

## MintService連携用データ

ウォレット作成後、MintServiceには以下を連携する:

| フィールド | 説明 |
|-----------|------|
| `walletAddress` | 作成されたウォレットアドレス |
| `sequence` | NFT番号（連番） |
| `name` | ユーザー名（検証用） |

> Civicshipはこれらの意味を解釈しない。NFTの意味付け・管理はMintService側の責務。

### MintService APIリクエスト例

```http
POST /api/mint
Authorization: Bearer <api_key>
Content-Type: application/json
```

```json
{
  "walletAddress": "addr1qx...",
  "sequence": 123,
  "name": "検証用ユーザー名"
}
```

---

## CSV出力要件（運用台帳）

### 出力目的

- NFTが割り当てられているが **ユーザー帰属が確定していないウォレット** を可視化する
- 後日の確認・紐付け・問い合わせ対応に利用する

### 出力対象

以下いずれかに該当するウォレットをCSV出力対象とする:

- Civicship上でユーザー未登録
- 電話番号は存在するが、`refreshToken` が存在しない（ユーザー未確定）

### 出力CSVのカラム（確定）

| 列名 | 内容 |
|------|------|
| `walletAddress` | 作成されたウォレット |
| `nftSequence` | 割り当てられた連番 |

**含めないもの:**
- ユーザー名（name）
- 電話番号
- 認証状態

---

## NFT情報取得要件

### 取得条件

NFT情報（外部参照）は、以下 **すべて** を満たす場合のみ取得する:

1. 認証済みユーザーである
2. ユーザー状態が「確定」である（`refreshToken` が存在）
3. ウォレットアドレスが紐付いている

### 非取得時の挙動

条件未達の場合:
- 外部NFT取得は行わない
- 結果は **空配列** として扱う
- エラーは返さない

---

## シーケンス図

### CSVバッチミントフロー

```
┌─────────┐     ┌──────────┐     ┌─────────────┐     ┌─────────────┐
│ 管理者   │     │ Script   │     │ Civicship   │     │ MintService │
└────┬────┘     └────┬─────┘     └──────┬──────┘     └──────┬──────┘
     │               │                   │                   │
     │ CSV投入       │                   │                   │
     │ (phoneNumber, │                   │                   │
     │  nftSequence, │                   │                   │
     │  name)        │                   │                   │
     │──────────────>│                   │                   │
     │               │                   │                   │
     │               │ 1. 電話番号認証   │                   │
     │               │──────────────────>│                   │
     │               │                   │                   │
     │               │ 2. JWT取得        │                   │
     │               │   (Firebase UID含む)                  │
     │               │<──────────────────│                   │
     │               │                   │                   │
     │               │ 3. ウォレット作成/取得                │
     │               │   (Firebase UIDで)│                   │
     │               │──────────────────>│                   │
     │               │                   │                   │
     │               │ 4. walletAddress  │                   │
     │               │<──────────────────│                   │
     │               │                   │                   │
     │               │ 5. POST /api/mint │                   │
     │               │   { walletAddress, sequence, name }   │
     │               │──────────────────────────────────────>│
     │               │                   │                   │
     │               │                   │ 6. mint.completed │
     │               │                   │<──────────────────│
     │               │                   │                   │
     │               │                   │ 7. NftInstance    │
     │               │                   │    upsert         │
     │               │                   │                   │
     │               │ 8. 出力CSV生成    │                   │
     │               │   (未確定ユーザー分)                  │
     │               │<──────────────────│                   │
     │               │                   │                   │
     │ 出力CSV受領   │                   │                   │
     │<──────────────│                   │                   │
```

---

## 実装対象

### scripts/

```
scripts/emergencyNftMint/
  ├── index.ts           # メインスクリプト
  ├── csvParser.ts       # 入力CSV解析
  ├── walletCreator.ts   # ウォレット作成処理
  ├── mintRequester.ts   # MintService API呼び出し
  └── outputGenerator.ts # 出力CSV生成
```

### 入力CSVサンプル

```csv
phoneNumber,nftSequence,name
+819012345678,1,山田太郎
+819023456789,2,鈴木花子
+819034567890,3,佐藤一郎
```

### 出力CSVサンプル

```csv
walletAddress,nftSequence
addr1qx...,1
addr1qy...,3
```

---

## 非要件（明示）

以下は本緊急対応のスコープ外:

- NFTメタデータのDB永続化
- NFT名称・番号のCivicship管理
- ユーザー名のDB保存・外部連携
- NFT状態同期用Webhook
- CSVフォーマットの拡張

---

## 設計意図

1. **名前（ユーザー名）を完全に検証用途に限定** することで:
   - 個人情報の拡散を防ぐ
   - Civicshipの責務肥大化を防ぐ

2. **システム上は最小限かつ追跡可能な導線のみを持つ**:
   ```
   電話番号 → JWT → Firebase UID → ウォレット
   ```

3. **緊急対応でありつつ、将来の再設計を妨げない構成とする**

---

## 環境変数

```env
# MintService
MINT_SERVICE_API_URL=https://mint-service.example.com
MINT_SERVICE_API_KEY=xxx

# Firebase (既存)
FIREBASE_PROJECT_ID=xxx
```

---

## Open Questions

| 項目 | 状態 | 備考 |
|------|------|------|
| 電話番号 → Firebase UID 解決方法 | 要確認 | Firebase Admin API / DB検索（既存ユーザー前提）/ 新規認証フロー |
| 電話番号が解決できない場合の挙動 | 要確認 | スキップ / エラーCSV出力 / 処理中断 |
| MintService側の `/api/mint` が `walletAddress + sequence + name` を受け付けるか | 要確認 | 現行は `productId + firebaseUid` 形式 |
| `sequence` と `productId` の関係 | 要確認 | 同一商品内の連番か、別概念か |
| 出力CSVの保存場所 | 未定 | GCS / ローカル / 管理画面 |
| 電話番号のフォーマット | 要確認 | E.164形式（+81...）/ 国内形式（090...） |
