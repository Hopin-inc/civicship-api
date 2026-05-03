# NFT 連携 REST API ガイド (外部業者向け)

NFT のウォレット登録・コントラクトメタデータ登録・単一インスタンス登録を行う 3 本の REST エンドポイントについて、外部業者が連携実装するために必要な情報をまとめる。

NFT を mint している業者がリクエスト時にメタデータをそのまま送付し、Civicship 側はその内容で DB を upsert するモデル。Civicship 側からチェーンや外部 API へ問い合わせは行わない。

## 対象エンドポイント

| メソッド | パス | 用途 |
| --- | --- | --- |
| `PUT` | `/api/nft-wallets/:walletAddress` | ユーザーの NFT ウォレットアドレスを登録 (推奨) |
| `POST` | `/api/nft-wallets` | 同上 (旧形式、後方互換のため残置) |
| `GET` | `/api/nft-wallets/:walletAddress` | 登録済みウォレットを取得 (検証用) |
| `PUT` | `/api/nft-tokens/:address` | コントラクトメタデータを登録/更新 |
| `GET` | `/api/nft-tokens/:address` | コントラクトメタデータを取得 (検証用) |
| `PUT` | `/api/nft-tokens/:address/instances/:instanceId` | 単一 NFT インスタンスを登録/更新 |
| `GET` | `/api/nft-tokens/:address/instances/:instanceId` | 単一 NFT インスタンスを取得 (検証用) |
| `GET` | `/api/nft-tokens/:address/instances` | コントラクト配下のインスタンス一覧 (検証用、ページネーション) |

ベース URL は環境ごとに別途共有する。

## 共通仕様

### 認証

| 認証ヘッダ | 必須エンドポイント | 内容 |
| --- | --- | --- |
| `X-API-Key: <key>` | 全 3 本 | 業者ごとに発行する API キー (供与方法は別途連絡) |
| `Authorization: Bearer <Firebase ID Token>` | `PUT /api/nft-wallets/...`、`POST /api/nft-wallets` のみ | エンドユーザーを特定するための Firebase 電話番号認証トークン |

`PUT /api/nft-tokens/...` (instance を含む) は登録/更新用途のため、ユーザー JWT は不要 (API キーのみ)。

### Content-Type

リクエストボディがある場合は `Content-Type: application/json` を指定する。

### レスポンス共通

- 成功時: HTTP `200` で `{"success": true, ...}` 形式の JSON を返却。
- 失敗時: 該当ステータスコードと `{"error": "<message>"}` 形式の JSON。

### レート制限

| エンドポイント | 上限 |
| --- | --- |
| `PUT /api/nft-wallets/:walletAddress` / `POST /api/nft-wallets` | 1 リクエスト / 秒 / IP |
| `PUT /api/nft-tokens/:address` | 10 リクエスト / 分 / IP |
| `PUT /api/nft-tokens/:address/instances/:instanceId` | 10 リクエスト / 分 / IP |
| `GET /api/nft-*` (各 GET エンドポイント) | 60 リクエスト / 分 / IP |

上限を超えると `429 Too Many Requests` を返す。レスポンスヘッダ `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset` を参照可能。

### 共通エラー

| ステータス | 発生条件 |
| --- | --- |
| `400 Bad Request` | リクエストボディ/パスパラメータの形式不正 |
| `401 Unauthorized` | `X-API-Key` 欠落・無効、または Firebase JWT 欠落・無効 |
| `404 Not Found` | 参照先のレコード (`NftToken` / `NftWallet`) が未登録 |
| `429 Too Many Requests` | レート制限超過 |
| `500 Internal Server Error` | サーバー側内部エラー |

---

## 1. ウォレット登録

ユーザーが保有する EOA ウォレットアドレスを Civicship ユーザーに紐付ける。同じユーザーが既にウォレットを登録済みの場合はアドレスを上書きする。別ユーザーに既に紐付いている場合はエラー。

新規連携は `PUT /api/nft-wallets/:walletAddress` 推奨。`POST /api/nft-wallets` は旧形式で、後方互換のため残置している。

### 1-a. PUT 形式 (推奨)

```
PUT /api/nft-wallets/:walletAddress
X-API-Key: <key>
Authorization: Bearer <Firebase ID Token>
Content-Type: application/json
```

| パスパラメータ | 型 | 説明 |
| --- | --- | --- |
| `walletAddress` | string | 登録する EOA アドレス (`0x` + 40 桁の 16 進数) |

```json
{
  "name": "山田 太郎"
}
```

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `name` | string |   | ユーザー名。現在ユーザー名が「名前未設定」のときのみ更新される |

`200 OK`

```json
{ "success": true, "walletId": "ckxyz..." }
```

```bash
curl -X PUT "${BASE_URL}/api/nft-wallets/0xabc...123" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Authorization: Bearer ${FIREBASE_ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"山田 太郎"}'
```

### 1-b. POST 形式 (旧形式・後方互換)

```
POST /api/nft-wallets
X-API-Key: <key>
Authorization: Bearer <Firebase ID Token>
Content-Type: application/json
```

```json
{
  "walletAddress": "0xabc...123",
  "name": "山田 太郎"
}
```

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `walletAddress` | string | ✓ | 登録する EOA アドレス |
| `name` | string |   | ユーザー名 |

レスポンスは PUT 形式と同じ。

### 共通の主なエラー

| ステータス | 内容 |
| --- | --- |
| `400 Bad Request` | `walletAddress` の形式が不正 / `name` が文字列でない |
| `500 Internal Server Error` | アドレスが他ユーザーに既に紐付いている等の登録失敗 |

### 1-c. GET (検証用)

```
GET /api/nft-wallets/:walletAddress
X-API-Key: <key>
```

`200 OK`

```json
{
  "id": "ckxyz...",
  "walletAddress": "0xabc...123",
  "userId": "ckuser...",
  "type": "EXTERNAL",
  "createdAt": "2026-04-27T01:00:00.000Z",
  "updatedAt": "2026-04-27T01:00:00.000Z"
}
```

主なエラー:

| ステータス | エラー内容 (`entity`) | 説明 |
| --- | --- | --- |
| `400 Bad Request` | ― | `walletAddress` の形式が不正 |
| `404 Not Found` | `NftWallet` | ウォレットが未登録 |

```bash
curl -X GET "${BASE_URL}/api/nft-wallets/0xabc...123" \
  -H "X-API-Key: ${API_KEY}"
```

---

## 2. NFT コントラクト (token) の登録/更新

業者がコントラクトメタデータを送り、Civicship 側で `NftToken` レコードを upsert する。冪等。

### リクエスト

```
PUT /api/nft-tokens/:address
X-API-Key: <key>
Content-Type: application/json
```

| パスパラメータ | 型 | 説明 |
| --- | --- | --- |
| `address` | string | EVM コントラクトアドレス (`0x` + 40 桁の 16 進数) |

```json
{
  "type": "ERC721",
  "name": "Civicship Membership",
  "symbol": "CSM",
  "decimals": "0",
  "totalSupply": "10000",
  "holders": "1234",
  "exchangeRate": null,
  "circulatingMarketCap": null,
  "iconUrl": "https://example.com/icon.png",
  "metadata": {
    "anyAdditional": "key/value"
  }
}
```

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `type` | string | ✓ | `"ERC721"` / `"ERC1155"` / `"UNKNOWN"` 等 |
| `name` | string |   | コントラクト名 |
| `symbol` | string |   | シンボル |
| `decimals` | string |   | 小数桁数 |
| `totalSupply` | string |   | 総供給量 |
| `holders` | string |   | 保有者数 |
| `exchangeRate` | string |   | 取引レート |
| `circulatingMarketCap` | string |   | 流通時価総額 |
| `iconUrl` | string |   | アイコン URL |
| `metadata` | object |   | 上記以外の任意の追加データ |

リクエストボディ全体は `NftToken.json` カラムに保存される。

### レスポンス

`200 OK`

```json
{
  "success": true,
  "id": "ckxyz...",
  "address": "0xabc...123"
}
```

| フィールド | 説明 |
| --- | --- |
| `id` | Civicship 側の `NftToken.id` (UUID) |
| `address` | 登録/更新したコントラクトアドレス |

### 主なエラー

| ステータス | 内容 |
| --- | --- |
| `400 Bad Request` | `address` の形式が不正 / `type` が欠落 / 任意フィールドの型が不正 |
| `500 Internal Server Error` | サーバー側内部エラー (DB 等) |

### curl 例

```bash
curl -X PUT "${BASE_URL}/api/nft-tokens/0xabc...123" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ERC721",
    "name": "Civicship Membership",
    "symbol": "CSM"
  }'
```

### GET (検証用)

```
GET /api/nft-tokens/:address
X-API-Key: <key>
```

`200 OK` でレコード全体 (`id`, `address`, `name`, `symbol`, `type`, `json`, `communityId`, `createdAt`, `updatedAt`) を返す。`json` には PUT で送ったボディが格納されている。

主なエラー:

| ステータス | エラー内容 (`entity`) | 説明 |
| --- | --- | --- |
| `400 Bad Request` | ― | `address` の形式が不正 |
| `404 Not Found` | `NftToken` | コントラクトが未登録 |

```bash
curl -X GET "${BASE_URL}/api/nft-tokens/0xabc...123" \
  -H "X-API-Key: ${API_KEY}"
```

---

## 3. NFT インスタンスの登録/更新

業者がインスタンスメタデータと所有者ウォレットアドレスを送り、Civicship 側で `NftInstance` レコードを upsert する。冪等。所有権移転時はこのエンドポイントを再度呼ぶことで `nftWalletId` (所有者) が更新される。

事前条件:

- 指定 `tokenAddress` の `NftToken` が Civicship に存在していること (なければ先に「2. NFT コントラクト (token) の登録/更新」を実行)
- `ownerWalletAddress` が Civicship に登録済みの `NftWallet` であること (`PUT /api/nft-wallets/:walletAddress` または `POST /api/nft-wallets` 経由で登録済み)

### リクエスト

```
PUT /api/nft-tokens/:address/instances/:instanceId
X-API-Key: <key>
Content-Type: application/json
```

| パスパラメータ | 型 | 説明 |
| --- | --- | --- |
| `tokenAddress` | string | EVM コントラクトアドレス (`0x` + 40 桁の 16 進数) |
| `instanceId` | string | オンチェーンの NFT インスタンス ID (10 進数文字列) |

```json
{
  "ownerWalletAddress": "0xdef...456",
  "name": "メンバーシップ #42",
  "description": "Civicship community member token #42",
  "imageUrl": "https://example.com/nft/42.png",
  "metadata": {
    "attributes": [{ "trait_type": "tier", "value": "gold" }]
  }
}
```

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `ownerWalletAddress` | string | ✓ | 所有者の EOA アドレス。事前に `PUT /api/nft-wallets/:walletAddress` 等で登録済みであること |
| `name` | string |   | インスタンス名 |
| `description` | string |   | 説明 |
| `imageUrl` | string |   | 画像 URL |
| `metadata` | object |   | 上記以外の任意の追加データ |

リクエストボディ全体は `NftInstance.json` カラムに保存される。

### レスポンス

`200 OK`

```json
{
  "success": true,
  "id": "ckxyz...",
  "instanceId": "42",
  "tokenAddress": "0xabc...123",
  "nftTokenId": "ckxyz..."
}
```

| フィールド | 説明 |
| --- | --- |
| `id` | Civicship 側の `NftInstance.id` (UUID) |
| `instanceId` | NFT のオンチェーン ID |
| `tokenAddress` | NFT のコントラクトアドレス |
| `nftTokenId` | 紐付く `NftToken.id` (UUID) |

### 主なエラー

| ステータス | エラー内容 (`entity`) | 説明 |
| --- | --- | --- |
| `400 Bad Request` | ― | `tokenAddress` / `instanceId` の形式不正、`ownerWalletAddress` 欠落・形式不正、任意フィールドの型不正 |
| `404 Not Found` | `NftToken` | 指定アドレスの `NftToken` が未登録 |
| `404 Not Found` | `NftWallet` | `ownerWalletAddress` が Civicship に未登録 |
| `500 Internal Server Error` | ― | サーバー側内部エラー (DB 等) |

`404` のレスポンスには未登録のエンティティを示す `entity` フィールドが含まれる:

```json
{
  "error": "NftToken not found (address: 0xabc...123)",
  "entity": "NftToken"
}
```

### curl 例

```bash
curl -X PUT "${BASE_URL}/api/nft-tokens/0xabc...123/instances/42" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "ownerWalletAddress": "0xdef...456",
    "name": "メンバーシップ #42",
    "imageUrl": "https://example.com/nft/42.png"
  }'
```

### GET (検証用)

```
GET /api/nft-tokens/:address/instances/:instanceId
X-API-Key: <key>
```

`200 OK`

```json
{
  "id": "ckxyz...",
  "instanceId": "42",
  "tokenAddress": "0xabc...123",
  "nftTokenId": "ckxyz...",
  "ownerWalletAddress": "0xdef...456",
  "nftWalletId": "ckwallet...",
  "name": "メンバーシップ #42",
  "description": "...",
  "imageUrl": "https://example.com/nft/42.png",
  "json": { "...": "..." },
  "status": "OWNED",
  "communityId": null,
  "createdAt": "2026-04-27T01:00:00.000Z",
  "updatedAt": "2026-04-27T01:00:00.000Z"
}
```

主なエラー:

| ステータス | エラー内容 (`entity`) | 説明 |
| --- | --- | --- |
| `400 Bad Request` | ― | `tokenAddress` または `instanceId` の形式が不正 |
| `404 Not Found` | `NftInstance` | 指定 `(tokenAddress, instanceId)` のインスタンスが未登録 |

```bash
curl -X GET "${BASE_URL}/api/nft-tokens/0xabc...123/instances/42" \
  -H "X-API-Key: ${API_KEY}"
```

### GET 一覧 (検証用)

コントラクト配下の `NftInstance` をページネーション付きで返す。

```
GET /api/nft-tokens/:address/instances?limit=50&cursor=<id>
X-API-Key: <key>
```

| クエリ | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `limit` | number | 50 | 1 ページあたりの件数。最大 200 |
| `cursor` | string | (なし) | 直前のレスポンスの `nextCursor` を渡すと次ページを取得 |

`200 OK`

```json
{
  "items": [
    {
      "id": "ckxyz...",
      "instanceId": "42",
      "tokenAddress": "0xabc...123",
      "ownerWalletAddress": "0xdef...456",
      "name": "メンバーシップ #42",
      "...": "..."
    }
  ],
  "nextCursor": "ckxyz...",
  "hasNext": true
}
```

`items` の各要素は単一 GET と同じスキーマ。`hasNext` が `false` または `nextCursor` が `null` のときは最終ページ。並び順は `createdAt` 降順。

主なエラー:

| ステータス | 説明 |
| --- | --- |
| `400 Bad Request` | `address` の形式が不正 |

```bash
curl -X GET "${BASE_URL}/api/nft-tokens/0xabc...123/instances?limit=50" \
  -H "X-API-Key: ${API_KEY}"
```

---

## 運用上の注意

- `PUT /api/nft-tokens/...` (instance を含む) は **冪等** な upsert 操作。失敗時の再実行は安全。
- 所有権移転を取り込むには、移転先ウォレットを `PUT /api/nft-wallets/:walletAddress` で登録した上で `PUT /api/nft-tokens/:address/instances/:instanceId` を新しい `ownerWalletAddress` で再送する。
- 大量の連続登録が必要な場合は別途相談。デフォルトのレートリミットは個別運用前提に設定されている。
- 連携用 API キーは公開しないこと。漏洩が疑われる場合は速やかに連絡し、無効化対応を行うこと。
