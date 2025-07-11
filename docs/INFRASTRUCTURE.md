# インフラストラクチャガイド

このドキュメントでは、civicship-apiの外部システム統合、データベース設定、およびインフラストラクチャコンポーネントについて説明します。

## インフラストラクチャ層 (`src/infrastructure/`)

**目的:** 外部システムとの統合、データ永続化、技術的関心事

```
infrastructure/
├── prisma/              # データベースORM
│   ├── schema.prisma   # データベーススキーマ定義
│   ├── migrations/     # データベースマイグレーション
│   ├── seeds/          # 開発・テスト用データ
│   └── factories/      # テストデータファクトリー
└── libs/               # 外部サービス統合
    ├── firebase.ts     # Firebase Admin SDK
    ├── storage.ts      # Google Cloud Storage
    ├── line.ts         # LINE Messaging API
    └── did.ts          # IDENTUS DID/VC統合
```

## データベース設定

### Prisma ORM設定

**設定ファイル:** `src/infrastructure/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**主要機能:**
- PostgreSQL 16.4との統合
- 型安全なデータベースアクセス
- 自動マイグレーション管理
- Row-Level Security (RLS) サポート

### データベース接続

**開発環境:**
```bash
# Docker Compose経由でPostgreSQL 16.4を起動
DATABASE_URL=postgresql://civicship:civicship@localhost:15432/civicship
```

**本番環境:**
- Google Cloud SQL PostgreSQL
- SSL/TLS暗号化接続
- コネクションプーリング
- 自動バックアップ

## 外部システム統合

### Firebase Authentication

**実装ファイル:** `src/infrastructure/libs/firebase.ts`

```typescript
import admin from 'firebase-admin';

// Firebase Admin SDK初期化
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

// マルチテナント認証サポート
export const getTenantAuth = (tenantId: string) => {
  return admin.auth(firebaseApp).tenantManager().authForTenant(tenantId);
};
```

**機能:**
- JWT トークン検証
- マルチテナント認証
- カスタムクレーム管理
- ユーザー管理API

### Google Cloud Storage

**実装ファイル:** `src/infrastructure/libs/storage.ts`

```typescript
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

export const uploadFile = async (file: Buffer, fileName: string) => {
  const fileUpload = bucket.file(fileName);
  await fileUpload.save(file);
  return fileUpload.publicUrl();
};
```

**機能:**
- 画像・ファイルアップロード
- 公開URL生成
- メタデータ管理
- アクセス制御

### LINE Messaging API

**実装ファイル:** `src/infrastructure/libs/line.ts`

```typescript
import { Client } from '@line/bot-sdk';

const lineClient = new Client({
  channelAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_MESSAGING_CHANNEL_SECRET!,
});

export const sendMessage = async (userId: string, message: string) => {
  return lineClient.pushMessage(userId, { type: 'text', text: message });
};
```

**機能:**
- プッシュメッセージ送信
- リッチメニュー管理
- LIFF (LINE Front-end Framework) 統合
- ユーザープロファイル取得

### IDENTUS DID/VC統合

**実装ファイル:** `src/infrastructure/libs/did.ts`

```typescript
import axios from 'axios';

const identusClient = axios.create({
  baseURL: process.env.IDENTUS_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.IDENTUS_API_SALT}`,
  },
});

export const createDID = async (userData: any) => {
  const response = await identusClient.post('/dids', userData);
  return response.data;
};
```

**機能:**
- 分散ID (DID) 作成
- 検証可能クレデンシャル (VC) 発行
- ブロックチェーン統合
- デジタルアイデンティティ管理

## 環境変数設定

詳細な環境変数設定については、[環境変数ガイド](./ENVIRONMENT.md) を参照してください。

### 必須インフラ変数

```env
# データベース
DATABASE_URL=postgresql://user:password@localhost:15432/civicship

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Cloud Storage
GCP_PROJECT_ID=your-gcp-project
GCS_BUCKET_NAME=your-bucket-name
GCS_SERVICE_ACCOUNT_BASE64=base64-encoded-service-account

# LINE API
LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=your-channel-access-token
LINE_MESSAGING_CHANNEL_SECRET=your-channel-secret
LIFF_ID=your-liff-id

# IDENTUS
IDENTUS_API_URL=https://your-identus-instance.com
IDENTUS_API_SALT=your-api-salt
```

## データベースマイグレーション

### マイグレーション管理

```bash
# 新しいマイグレーション作成
pnpm db:migrate

# マイグレーション適用
pnpm db:migrate deploy

# マイグレーション状態確認
pnpm db:migrate status
```

### シード データ

```bash
# マスターデータ投入（都市・州データ）
pnpm db:seed-master

# ドメインデータ投入（ユーザー・コミュニティ）
pnpm db:seed-domain
```

## 監視とログ

### アプリケーションログ

```typescript
import { logger } from '../infrastructure/logger';

// 構造化ログ記録
logger.info('Database connection established', {
  host: 'localhost',
  port: 15432,
  database: 'civicship'
});

logger.error('External API call failed', {
  service: 'firebase',
  error: error.message,
  userId: context.currentUser?.id
});
```

### パフォーマンス監視

- データベースクエリ実行時間
- 外部API応答時間
- メモリ使用量
- エラー率とアラート

## トラブルシューティング

よくあるインフラ問題の解決方法については、[トラブルシューティングガイド](./TROUBLESHOOTING.md) を参照してください。

### データベース接続問題

```bash
# PostgreSQLコンテナ状態確認
docker ps | grep postgres

# データベース接続テスト
pnpm db:studio
```

### Firebase認証問題

```bash
# Firebase設定確認
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CLIENT_EMAIL

# 秘密鍵フォーマット確認（改行が正しく含まれているか）
echo $FIREBASE_PRIVATE_KEY | grep "BEGIN PRIVATE KEY"
```

## 関連ドキュメント

- [アーキテクチャガイド](./ARCHITECTURE.md) - システム設計概要
- [セキュリティガイド](./SECURITY.md) - 認証・認可アーキテクチャ
- [デプロイメントガイド](./DEPLOYMENT.md) - 本番環境構成
- [環境変数ガイド](./ENVIRONMENT.md) - 詳細な環境設定
- [セットアップガイド](./SETUP.md) - 開発環境構築
