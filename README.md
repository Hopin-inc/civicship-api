# civicship-api
![logo.svg](./docs/asset/logo.svg)

## 概要

`civicship-api` は TypeScript で構築された GraphQL API サーバーで、**ドメイン駆動設計（DDD）** と **クリーンアーキテクチャ** の原則に従っています。ポイントベースの報酬システム、機会管理、LINE メッセージング統合を備えた包括的なコミュニティエンゲージメントプラットフォームを提供します。

**主要機能:**
- 👤 ユーザー・コミュニティ管理
- 🎯 機会・参加追跡システム
- 🎫 ポイントベース報酬システム
- 📱 LINE 統合・通知機能
- 📝 コンテンツ・メディア管理

詳細な機能については、[FEATURES.md](./docs/FEATURES.md) をご覧ください。

## クイックスタート

### 前提条件
- Node.js 20+, pnpm, Docker

### セットアップコマンド
```bash
# 1. 依存関係をインストール
pnpm install

# 2. PostgreSQL コンテナを起動（ポート 15432）
pnpm container:up

# 3. データベースを初期化
pnpm db:generate
pnpm db:seed-master
pnpm db:seed-domain

# 4. GraphQL 型を生成してサーバーを起動
pnpm gql:generate
pnpm dev:https
```

🚀 **API 利用可能:** ポート 3000 の GraphQL エンドポイント

### 環境設定

必要な環境変数を含む `.env` ファイルを作成してください:

```env
# コア設定
DATABASE_URL=postgresql://user:password@host:15432/civicship_dev
ENV=LOCAL
NODE_ENV=development
PORT=3000

# Firebase 認証（必須）
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Google Cloud Storage（必須）
GCS_SERVICE_ACCOUNT_BASE64=base64_encoded_service_account_json
GCS_BUCKET_NAME=your_bucket_name
GCP_PROJECT_ID=your_gcp_project_id
```

## アーキテクチャ概要

このプロジェクトは **ドメイン駆動設計（DDD）** と **クリーンアーキテクチャ** の原則に従っています。

### 高レベル構造
```
src/
├── application/domain/     # 🏗️ ビジネスロジック（7つのコアドメイン）
├── infrastructure/        # 🔌 データベース・外部サービス
├── presentation/         # 🌐 GraphQL API・ミドルウェア
└── types/               # 📝 共有型定義
```

### コアビジネスドメイン
- **account/** - ユーザー、コミュニティ、メンバーシップ、ウォレット管理
- **experience/** - 機会、予約、参加追跡
- **content/** - 記事、メディア管理
- **reward/** - ユーティリティ、チケット、ポイントベース報酬
- **transaction/** - ポイント転送、金融操作
- **notification/** - LINE メッセージング統合
- **location/** - 地理データ管理

## 📖 ドキュメント

### 🚀 はじめに
- 🔧 [セットアップガイド](./docs/SETUP.md) - 完全なインストール・設定手順
- 🌍 [環境変数設定](./docs/ENVIRONMENT.md) - 設定リファレンス
- 🔍 [トラブルシューティング](./docs/TROUBLESHOOTING.md) - よくある問題と解決方法

### 🏗️ アーキテクチャ・開発
- 🏗️ [アーキテクチャガイド](./docs/ARCHITECTURE.md) - システム設計・パターン
- 🎯 [ドメイン詳細](./docs/DOMAINS.md) - ビジネスロジック・ドメイン構造
- ⚡ [実装パターン](./docs/PATTERNS.md) - コードパターン・ベストプラクティス
- 👨‍💻 [開発ワークフロー](./docs/DEVELOPMENT.md) - 日常的な開発手順

### 📊 リファレンス
- ✨ [機能一覧](./docs/FEATURES.md) - 完全な機能概要
- 🗄️ [データベーススキーマ](./docs/ERD.md) - エンティティ関係図
- 🧪 [テスト](./docs/TESTING.md) - テスト戦略・実行方法
- 🚀 [デプロイメント](./docs/DEPLOYMENT.md) - 本番環境デプロイガイド

## ライセンス

このプロジェクトは GNU General Public License v3.0 (GPL-3.0) の下でライセンスされています。
詳細については [GNU GPL v3.0](https://www.gnu.org/licenses/gpl-3.0.html) をご覧ください。
