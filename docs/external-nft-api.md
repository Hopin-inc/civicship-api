# NFT 連携 REST API ガイド (外部業者向け)

NFT のウォレット登録・コントラクトメタデータの再同期・単一インスタンスの再同期を行う 3 本の REST エンドポイントについて、外部業者が連携実装するために必要な情報をまとめる。

## 対象エンドポイント

| メソッド | パス | 用途 |
| --- | --- | --- |
| `POST` | `/api/nft-wallets` | ユーザーの NFT ウォレットアドレスを登録 |
| `PUT` | `/api/nft-tokens/:address` | コントラクト単位でメタデータを再同期 |
| `PUT` | `/api/nft-instances/:tokenAddress/:instanceId` | 単一 NFT インスタンスを再同期 |

ベース URL は環境ごとに別途共有する。

## 共通仕様

### 認証

| 認証ヘッダ | 必須エンドポイント | 内容 |
| --- | --- | --- |
| `X-API-Key: <key>` | 全 3 本 | 業者ごとに発行する API キー (供与方法は別途連絡) |
| `Authorization: Bearer <Firebase ID Token>` | `POST /api/nft-wallets` のみ | エンドユーザーを特定するための Firebase 電話番号認証トークン |

`PUT /api/nft-tokens/...` および `PUT /api/nft-instances/...` は運用同期用途のため、ユーザー JWT は不要 (API キーのみ)。

### Content-Type

リクエストボディがある場合は `Content-Type: application/json` を指定する。

### レスポンス共通

- 成功時: HTTP `200` で `{"success": true, ...}` 形式の JSON を返却。
- 失敗時: 該当ステータスコードと `{"error": "<message>"}` 形式の JSON。

### レート制限

| エンドポイント | 上限 |
| --- | --- |
| `POST /api/nft-wallets` | 1 リクエスト / 秒 / IP |
| `PUT /api/nft-tokens/:address` | 10 リクエスト / 分 / IP |
| `PUT /api/nft-instances/:tokenAddress/:instanceId` | 10 リクエスト / 分 / IP |

上限を超えると `429 Too Many Requests` を返す。レスポンスヘッダ `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset` を参照可能。

### 共通エラー

| ステータス | 発生条件 |
| --- | --- |
| `401 Unauthorized` | `X-API-Key` 欠落・無効、または Firebase JWT 欠落・無効 |
| `429 Too Many Requests` | レート制限超過 |
| `500 Internal Server Error` | サーバー側内部エラー |

---

## 1. ウォレット登録

ユーザーが保有する EOA ウォレットアドレスを Civicship ユーザーに紐付ける。同じユーザーが既にウォレットを登録済みの場合はアドレスを上書きする。別ユーザーに既に紐付いている場合はエラー。

### リクエスト

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
| `name` | string |   | ユーザー名。現在ユーザー名が「名前未設定」のときのみ更新される |

### レスポンス

`200 OK`

```json
{
  "success": true,
  "walletId": "ckxyz..."
}
```

### 主なエラー

| ステータス | 内容 |
| --- | --- |
| `400 Bad Request` | `walletAddress` が文字列でない / `name` が文字列でない |
| `500 Internal Server Error` | アドレスが他ユーザーに既に紐付いている等の登録失敗 |

### curl 例

```bash
curl -X POST "${BASE_URL}/api/nft-wallets" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Authorization: Bearer ${FIREBASE_ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0xabc...123","name":"山田 太郎"}'
```

---

## 2. NFT コントラクト (token) の再同期

指定したコントラクトアドレスを Blockscout から取り直し、Civicship 側の `NftToken` レコードを upsert する。冪等。

### リクエスト

```
PUT /api/nft-tokens/:address
X-API-Key: <key>
```

| パスパラメータ | 型 | 説明 |
| --- | --- | --- |
| `address` | string | EVM コントラクトアドレス (`0x` + 40 桁の 16 進数) |

ボディ不要。

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
| `address` | 同期したコントラクトアドレス |

### 主なエラー

| ステータス | 内容 |
| --- | --- |
| `400 Bad Request` | `address` の形式が不正 |
| `502 Bad Gateway` | Blockscout への問い合わせに失敗 |
| `504 Gateway Timeout` | Blockscout への問い合わせがタイムアウト |

### curl 例

```bash
curl -X PUT "${BASE_URL}/api/nft-tokens/0xabc...123" \
  -H "X-API-Key: ${API_KEY}"
```

---

## 3. NFT インスタンスの再同期

指定したコントラクトアドレスとオンチェーンインスタンス ID の組で、単一 NFT インスタンスを Blockscout から取り直し、`NftInstance` レコードを upsert する。冪等。

事前条件:

- 指定 `tokenAddress` の `NftToken` が Civicship に存在していること (なければ先に「2. NFT コントラクト (token) の再同期」を実行)
- 取得した instance の現在の所有者ウォレットが、Civicship に登録済みの `NftWallet` であること (`POST /api/nft-wallets` 経由で登録済み)

### リクエスト

```
PUT /api/nft-instances/:tokenAddress/:instanceId
X-API-Key: <key>
```

| パスパラメータ | 型 | 説明 |
| --- | --- | --- |
| `tokenAddress` | string | EVM コントラクトアドレス (`0x` + 40 桁の 16 進数) |
| `instanceId` | string | オンチェーンの NFT インスタンス ID (10 進数文字列) |

ボディ不要。

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
| `instanceId` | 同期した NFT のオンチェーン ID |
| `tokenAddress` | 同期した NFT のコントラクトアドレス |
| `nftTokenId` | 紐付く `NftToken.id` (UUID) |

### 主なエラー

| ステータス | エラー内容 (`entity`) | 説明 |
| --- | --- | --- |
| `400 Bad Request` | ― | `tokenAddress` または `instanceId` の形式が不正 |
| `404 Not Found` | `NftToken` | 指定アドレスの `NftToken` が未登録 |
| `404 Not Found` | `NftInstanceOwner` | Blockscout レスポンスに所有者アドレスが含まれない |
| `404 Not Found` | `NftWallet` | 所有者ウォレットが Civicship に未登録 |
| `502 Bad Gateway` | ― | Blockscout への問い合わせに失敗 |
| `504 Gateway Timeout` | ― | Blockscout への問い合わせがタイムアウト |

`404` のレスポンスには未登録のエンティティを示す `entity` フィールドが含まれる:

```json
{
  "error": "NftToken not found (address: 0xabc...123)",
  "entity": "NftToken"
}
```

### curl 例

```bash
curl -X PUT "${BASE_URL}/api/nft-instances/0xabc...123/42" \
  -H "X-API-Key: ${API_KEY}"
```

---

## 運用上の注意

- `PUT /api/nft-tokens/...` と `PUT /api/nft-instances/...` は **冪等** な upsert 操作。失敗時の再実行は安全。
- インスタンス再同期は所有者を Blockscout から取得して上書きするため、所有権移転の取り込みにも利用可能 (移転先ウォレットが Civicship に登録済みであることが前提)。
- 大量の連続同期が必要な場合は別途相談。デフォルトのレートリミットは個別運用前提に設定されている。
- 連携用 API キーは公開しないこと。漏洩が疑われる場合は速やかに連絡し、無効化対応を行うこと。
