# 詳細セットアップガイド

このガイドでは、civicship-api の開発環境をゼロから設定するための包括的な手順を提供します。

## 前提条件

### 必要なソフトウェア

開始前に、以下がインストールされていることを確認してください：

- **Node.js 20+** - JavaScript ランタイム ([ダウンロード](https://nodejs.org/))
- **pnpm** - パッケージマネージャー（npm/yarn より高速）
  ```bash
  npm install -g pnpm
  ```
- **Docker** - PostgreSQL コンテナ用 ([ダウンロード](https://www.docker.com/))
- **Git** - バージョン管理 ([ダウンロード](https://git-scm.com/))

### システム要件
- **オペレーティングシステム:** Linux、macOS、または WSL2 付き Windows
- **メモリ:** 最低 4GB RAM、推奨 8GB
- **ストレージ:** 依存関係とデータベース用に 2GB の空き容量

## ステップバイステップセットアップ

### 1. プロジェクトのインストール

```bash
# リポジトリをクローン（まだ行っていない場合）
git clone https://github.com/Hopin-inc/civicship-api.git
cd civicship-api

# develop ブランチに切り替え
git checkout develop

# すべての依存関係をインストール
pnpm install
```

**期待される出力:**
- 依存関係が正常にインストールされる
- セキュリティ脆弱性が報告されない
- `node_modules/` ディレクトリが作成される

### 2. 環境設定

```bash
# 環境ファイルを作成
cp .env.example .env

# 設定で .env ファイルを編集
# お好みのエディタを使用（nano、vim、code など）
nano .env
```

**必要な設定:**
完全な変数リストと値については、[環境変数ガイド](./ENVIRONMENT.md) を参照してください。

**最低限必要な変数:**
```env
DATABASE_URL=postgresql://user:password@host:15432/civicship_dev
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GCS_SERVICE_ACCOUNT_BASE64=base64_encoded_service_account_json
GCS_BUCKET_NAME=your_bucket_name
GCP_PROJECT_ID=your_gcp_project_id
```

### 3. データベースセットアップ

```bash
# PostgreSQL 16.4 コンテナを起動（ポート 15432）
pnpm container:up

# コンテナが実行中であることを確認
docker ps | grep postgres
```

**期待される出力:**
```
CONTAINER ID   IMAGE         COMMAND                  CREATED         STATUS         PORTS                     NAMES
abc123def456   postgres:16.4 "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:15432->5432/tcp   civicship-db
```

```bash
# スキーマから Prisma クライアントを生成
pnpm db:generate
```

**期待される出力:**
- Prisma クライアントが正常に生成される
- 型定義が `node_modules/.prisma/client/` に作成される

### 4. データベースシーディング（2段階プロセス）

データベースシーディングプロセスは、適切なデータ関係を確保するために2つのステップに分かれています：

```bash
# ステップ1: マスターデータをシード（都市、州、国）
pnpm db:seed-master
```

**期待される出力:**
```
✅ マスターデータシーディング完了
   - 都道府県: 47 レコード
   - 市区町村: 1,741 レコード
   - 国: 195 レコード
```

```bash
# ステップ2: ドメインデータをシード（ユーザー、コミュニティ、機会）
pnpm db:seed-domain
```

**期待される出力:**
```
✅ ドメインデータシーディング完了
   - ユーザー: 10 レコード
   - コミュニティ: 5 レコード
   - 機会: 15 レコード
   - メンバーシップ: 25 レコード
```

**シーディングの確認:**
```bash
# Prisma Studio を開いてデータベース内容を表示
pnpm db:studio
```

### 5. GraphQL 型生成

```bash
# GraphQL スキーマから TypeScript 型を生成
pnpm gql:generate
```

**期待される出力:**
- GraphQL 型が `src/types/generated/` に生成される
- スキーマファイルが正常に処理される

**生成されたファイルの確認:**
```bash
# 生成されたファイルが存在することを確認
ls -la src/types/generated/
```

### 6. ビルドと開発サーバーの起動

```bash
# TypeScript を JavaScript にコンパイル
pnpm build
```

**期待される出力:**
- TypeScript コンパイルが成功
- JavaScript ファイルが `dist/` ディレクトリに作成される

```bash
# HTTPS 開発サーバーを起動
pnpm dev:https
```

**期待される出力:**
```
🚀 サーバー準備完了: https://localhost:3000/graphql
📊 GraphQL Playground: https://localhost:3000/graphql
🔍 ヘルスチェック: https://localhost:3000/health
```

## 検証手順

### 1. データベース接続

```bash
# PostgreSQL コンテナが実行中かチェック
docker ps | grep civicship

# データベース接続をテスト
pnpm db:studio
```

**成功の指標:**
- コンテナが "Up" ステータスを表示
- Prisma Studio がブラウザで開く
- データベーステーブルがシードデータと共に表示される

### 2. GraphQL API

```bash
# サーバーを起動（まだ実行していない場合）
pnpm dev:https

# GraphQL エンドポイントをテスト
curl -X POST https://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}'
```

**期待されるレスポンス:**
```json
{"data":{"__typename":"Query"}}
```

### 3. 認証

```bash
# Firebase 初期化のサーバーログをチェック
# 以下のようなメッセージを探す:
# "Firebase Admin initialized successfully"
# "Authentication middleware loaded"
```

### 4. ファイルアップロード（GCS）

GraphQL Playground を通じてファイルアップロード機能をテスト:
1. https://localhost:3000/graphql を開く
2. 画像アップロードミューテーションを実行
3. ファイルが GCS バケットに表示されることを確認

## 開発ワークフロー

### 日常的な開発コマンド

```bash
# ホットリロード付き開発サーバーを起動
pnpm dev:https

# テストを実行
pnpm test

# リンティングを実行
pnpm lint
pnpm lint:graphql

# データベース操作
pnpm db:studio     # データベースブラウザを開く
pnpm db:reset      # データベースをリセット（注意！）
pnpm db:migrate    # 新しいマイグレーションを適用
```

### コード生成コマンド

```bash
# GraphQL スキーマ変更後
pnpm gql:generate

# Prisma スキーマ変更後
pnpm db:generate
pnpm db:migrate
```

### コンテナ管理

```bash
# コンテナを起動
pnpm container:up

# コンテナを停止
pnpm container:down

# コンテナログを表示
docker logs civicship-db

# PostgreSQL に直接アクセス
docker exec -it civicship-db psql -U postgres -d civicship_dev
```

## よくあるセットアップ問題

### ポート競合

**問題:** ポート 15432 が既に使用中
```bash
# ポートを使用しているプロセスを見つける
lsof -i :15432

# 必要に応じてプロセスを終了
kill -9 <PID>

# または docker-compose.yaml で異なるポートを使用
```

### 権限の問題

**問題:** Docker の権限が拒否される
```bash
# ユーザーを docker グループに追加（Linux）
sudo usermod -aG docker $USER
newgrp docker

# または sudo で実行（開発には推奨されない）
sudo pnpm container:up
```

### 環境変数の問題

**問題:** Firebase 認証が失敗する
- FIREBASE_PRIVATE_KEY に適切な改行（`\n`）があることを確認
- サービスアカウントに正しい権限があることを確認
- Firebase プロジェクトで認証が有効になっていることを確認

**問題:** データベース接続が失敗する
- DATABASE_URL の形式を確認
- PostgreSQL コンテナが実行中であることを確認
- データベースが存在することを確認

### メモリの問題

**問題:** ビルド中にメモリ不足
```bash
# Node.js メモリ制限を増加
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

## パフォーマンス最適化

### 開発サーバー

```bash
# より高速なビルドのために開発モードを使用
NODE_ENV=development pnpm dev:https

# TypeScript インクリメンタルコンパイルを有効化
# （tsconfig.json で既に設定済み）
```

### データベースパフォーマンス

```bash
# データベースパフォーマンスを監視
pnpm db:studio

# 遅いクエリを表示（必要に応じて）
docker exec -it civicship-db psql -U postgres -d civicship_dev \
  -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## 次のステップ

セットアップ成功後:

1. **コードベースを探索:**
   - [アーキテクチャガイド](./ARCHITECTURE.md) を読む
   - [ドメイン詳細](./DOMAINS.md) を確認
   - [実装パターン](./PATTERNS.md) を学習

2. **開発を開始:**
   - [開発ワークフロー](./DEVELOPMENT.md) に従う
   - `pnpm test` でテストを実行
   - `pnpm lint` でコード品質をチェック

3. **API を学習:**
   - GraphQL Playground を探索
   - 既存のクエリとミューテーションを確認
   - 認証フローをテスト

## ヘルプの取得

このガイドでカバーされていない問題が発生した場合:

1. [トラブルシューティングガイド](./TROUBLESHOOTING.md) を確認
2. エラーメッセージのサーバーログを確認
3. すべての環境変数が正しく設定されていることを確認
4. すべての前提条件が適切にインストールされていることを確認

## 関連ドキュメント

- [環境変数](./ENVIRONMENT.md) - 設定リファレンス
- [トラブルシューティング](./TROUBLESHOOTING.md) - 問題解決
- [アーキテクチャガイド](./ARCHITECTURE.md) - システム設計
- [開発ワークフロー](./DEVELOPMENT.md) - 日常的な手順
