# API仕様書 - ウォレットアドレス更新エンドポイント

## 概要
このAPIは、APIキー認証とFirebase電話番号認証を使用して、ユーザーのウォレットアドレスを安全に更新するためのRESTエンドポイントです。

## エンドポイント情報

### PUT /api/wallet-address

ユーザーのウォレットアドレスを更新します。

#### 認証要件
- **APIキー認証**: リクエストヘッダーに有効なAPIキーが必要
- **Firebase電話番号認証**: Firebase IDトークンによる認証が必要

#### レート制限
- **制限**: 15分間に5回まで
- **適用範囲**: IPアドレス単位
- **制限超過時**: HTTP 429 Too Many Requests

#### リクエスト

**ヘッダー**
```
X-API-Key: {有効なAPIキー}
Authorization: Bearer {Firebase IDトークン}
Content-Type: application/json
```

**ボディ**
```json
{
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**パラメータ**
| フィールド | 型 | 必須 | 説明 |
|-----------|----|----|------|
| walletAddress | string | ✓ | 更新するウォレットアドレス |

#### レスポンス

**成功時 (200 OK)**
```json
{
  "success": true
}
```

**エラー時**

**400 Bad Request - ウォレットアドレスが未指定**
```json
{
  "error": "walletAddress is required"
}
```

**400 Bad Request - ウォレットアドレスの型が不正**
```json
{
  "error": "walletAddress must be a string"
}
```

**401 Unauthorized - APIキーが未指定**
```json
{
  "error": "API key is required"
}
```

**401 Unauthorized - APIキーが無効**
```json
{
  "error": "Invalid API key"
}
```

**401 Unauthorized - Firebase IDトークンが未指定**
```json
{
  "error": "Firebase ID token is required"
}
```

**401 Unauthorized - Firebase IDトークンが無効**
```json
{
  "error": "Invalid Firebase ID token"
}
```

**404 Not Found - ユーザーが見つからない**
```json
{
  "error": "User not found"
}
```

**429 Too Many Requests - レート制限超過**
```json
{
  "error": "Too many wallet address update requests from this IP, please try again later."
}
```

**500 Internal Server Error - サーバーエラー**
```json
{
  "error": "Internal server error"
}
```

## 使用例

### cURL
```bash
curl -X PUT https://your-api-domain.com/api/wallet-address \
  -H "X-API-Key: your-api-key-here" \
  -H "Authorization: Bearer your-firebase-id-token" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

### JavaScript (fetch)
```javascript
const response = await fetch('/api/wallet-address', {
  method: 'PUT',
  headers: {
    'X-API-Key': 'your-api-key-here',
    'Authorization': 'Bearer your-firebase-id-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
  })
});

const result = await response.json();
console.log(result);
```

## セキュリティ機能

### 認証
1. **APIキー認証**: データベースに保存された有効なAPIキーの検証
2. **Firebase電話番号認証**: Firebase IDトークンの検証とユーザー識別

### レート制限
- **厳格な制限**: ウォレット操作に対して15分間に5回まで
- **IPベース**: 各IPアドレスに対して個別に制限を適用
- **標準ヘッダー**: RateLimit-*ヘッダーでクライアントに制限情報を提供

### データ保護
- **Row Level Security**: データベースレベルでの組織間データ分離
- **トランザクション**: データ整合性を保証するトランザクション処理
- **ログ記録**: セキュリティ監査のための詳細ログ

## 技術仕様

### 依存関係
- Express.js
- Firebase Admin SDK
- Prisma ORM
- express-rate-limit

### データベース
- **テーブル**: User, ApiKey, Identity
- **関係**: Identity.uid → User (Firebase認証連携)
- **フィールド**: User.walletAddress (nullable string)

### ミドルウェア順序
1. レート制限 (`walletRateLimit`)
2. APIキー認証 (`apiKeyAuthMiddleware`)
3. Firebase電話番号認証 (`validateFirebasePhoneAuth`)
4. エンドポイント処理

## 運用考慮事項

### モニタリング
- レート制限の適用状況
- 認証失敗の頻度
- エラーレートの監視

### スケーリング
- Redis等の外部ストアを使用したレート制限の分散対応
- APIキーの管理とローテーション

### セキュリティ
- APIキーの定期的なローテーション
- 不審なアクセスパターンの監視
- ログの定期的な監査

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1.0.0 | 2025-06-28 | 初回リリース - APIキー認証とウォレットアドレス更新機能 |
| 1.0.1 | 2025-06-28 | レート制限機能追加 (CodeQLセキュリティアラート対応) |
