# コマンドリファレンス

このドキュメントでは、civicship-apiプロジェクトで使用可能な全てのコマンドを包括的に説明します。

## 利用可能なpnpmコマンド

### 開発・ビルド

```bash
# 開発サーバー
pnpm dev              # HTTP開発サーバー（ポート3000）
pnpm dev:https        # HTTPS開発サーバー（ポート3000、SSL証明書付き）
pnpm dev:external     # 外部API開発サーバー（ウォレット操作用）

# ビルド・起動
pnpm build            # TypeScriptコンパイル + GraphQLスキーマファイルコピー
pnpm start            # プロダクション環境でのアプリケーション起動
pnpm copy-graphql     # GraphQLスキーマファイルのみをdist/にコピー
```

### コード品質

```bash
# リンティング・フォーマット
pnpm lint             # ESLint + Prettier実行（自動修正付き）

# テスト
pnpm test             # Jest テストスイート実行
pnpm test:coverage    # カバレッジレポート付きテスト実行
```

### データベース操作

```bash
# Prisma基本操作
pnpm db:pull          # データベーススキーマをPrismaスキーマに反映
pnpm db:generate      # Prismaクライアント生成（スキーマフォーマット含む）
pnpm db:studio        # Prisma Studio起動（データベースGUI）

# マイグレーション
pnpm db:migrate       # 新しいマイグレーションファイル作成
pnpm db:deploy        # マイグレーションをデータベースに適用
pnpm db:migrate-reset # データベース完全リセット（全データ削除）
pnpm db:mark-rolled-back # マイグレーション巻き戻しマーク

# データシード
pnpm db:seed-master   # マスターデータ投入（都市・州データ）
pnpm db:seed-domain   # ドメインデータ投入（ユーザー・コミュニティデータ）
```

### GraphQL操作

```bash
# GraphQL型生成
pnpm gql:generate     # GraphQL型定義生成（codegen.yamlに基づく）
```

### Docker操作

```bash
# コンテナ管理
pnpm container:up     # PostgreSQLコンテナ起動（ポート15432）
pnpm container:down   # コンテナ停止・削除
```

## 利用できないコマンド（注意）

以下のコマンドは現在package.jsonに存在しません。代替手段を使用してください：

```bash
# 存在しないコマンド
pnpm lint:graphql     # → pnpm gql:generate でエラーチェック
pnpm gql:validate     # → 開発サーバー起動時の検証を利用
pnpm gql:diff         # → 手動でスキーマ比較
pnpm type-check       # → npx tsc --noEmit
pnpm test:integration # → pnpm test -- --testPathPattern=integration
pnpm test:watch       # → npx jest --watch
pnpm db:reset         # → pnpm db:migrate-reset
```

## 代替コマンド・手動実行

### TypeScript型チェック

```bash
# 手動型チェック
npx tsc --noEmit

# ビルド時の型チェック
pnpm build
```

### GraphQLスキーマ検証

```bash
# コード生成でのエラーチェック
pnpm gql:generate

# 開発サーバー起動時の検証
pnpm dev:https
# エラーがあればコンソールに表示される
```

### テストのパターンマッチング

```bash
# 統合テスト実行
pnpm test -- --testPathPattern=integration

# ユニットテスト実行
pnpm test -- --testPathPattern=unit

# 認証テスト実行
pnpm test -- --testPathPattern=auth

# 特定のファイルテスト
pnpm test -- __tests__/unit/account/user.service.test.ts

# ウォッチモード
npx jest --watch
```

## 環境別コマンド実行

### 開発環境

```bash
# 開発環境設定
NODE_ENV=development pnpm dev:https

# デバッグモード
DEBUG=prisma:query,graphql:* pnpm dev:https

# ログレベル設定
LOG_LEVEL=debug pnpm dev:https
```

### テスト環境

```bash
# テスト環境でのコマンド実行
NODE_ENV=test pnpm test

# テストデータベース使用
DATABASE_URL=postgresql://test:test@localhost:15432/civicship_test pnpm db:migrate
```

### 本番環境

```bash
# 本番ビルド
NODE_ENV=production pnpm build

# 本番起動
NODE_ENV=production pnpm start

# 本番テスト
NODE_ENV=production pnpm test
```

## デバッグ・監視コマンド

### アプリケーションデバッグ

```bash
# Node.jsデバッガー
node --inspect-brk dist/index.js

# デバッグログ有効化
DEBUG=* pnpm dev:https

# 特定のモジュールのデバッグ
DEBUG=prisma:query pnpm dev:https
DEBUG=graphql:* pnpm dev:https
```

### データベースデバッグ

```bash
# Prismaクエリログ
DEBUG=prisma:query pnpm dev:https

# データベース接続確認
pnpm db:studio
```

### パフォーマンス監視

```bash
# メモリ使用量監視
node --inspect pnpm dev:https
# chrome://inspect でプロファイリング

# ログファイル監視
tail -f logs/app.log
```

## Git・GitHub操作

### ブランチ操作

```bash
# 機能ブランチ作成
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# バグ修正ブランチ作成
git checkout -b fix/your-bug-fix-name
```

### コミット・プッシュ

```bash
# 変更をステージング
git add src/specific/file.ts
git add docs/

# コミット
git commit -m "feat: add new feature description"

# リモートにプッシュ
git push origin feature/your-feature-name
```

### プルリクエスト

```bash
# GitHub CLIでPR作成
gh pr create --title "Add new feature" --body "Description of changes"

# PR確認
gh pr view

# PR一覧
gh pr list
```

## Docker・コンテナ操作

### PostgreSQLコンテナ

```bash
# コンテナ起動
pnpm container:up
# または
docker-compose up -d

# コンテナ停止
pnpm container:down
# または
docker-compose down

# コンテナ状態確認
docker ps

# コンテナログ確認
docker-compose logs postgres
```

### データベース直接接続

```bash
# PostgreSQLに直接接続
psql postgresql://username:password@localhost:15432/civicship_dev

# Docker経由での接続
docker exec -it civicship-api-postgres-1 psql -U username -d civicship_dev
```

## ビルド・デプロイ関連

### ローカルビルド

```bash
# クリーンビルド
rm -rf dist/
pnpm build

# ビルド成果物確認
ls -la dist/

# 本番ビルドテスト
NODE_ENV=production node dist/index.js
```

### デプロイ準備

```bash
# 全チェック実行
pnpm lint
pnpm test
npx tsc --noEmit
pnpm build

# 環境変数確認
echo $DATABASE_URL
echo $FIREBASE_PROJECT_ID
```

## トラブルシューティングコマンド

### 依存関係の問題

```bash
# node_modules再インストール
rm -rf node_modules/
rm pnpm-lock.yaml
pnpm install

# キャッシュクリア
pnpm store prune
```

### データベースの問題

```bash
# データベース接続テスト
pnpm db:studio

# マイグレーション状態確認
npx prisma migrate status

# データベースリセット
pnpm db:migrate-reset
pnpm db:seed-master
pnpm db:seed-domain
```

### GraphQLの問題

```bash
# スキーマ再生成
pnpm gql:generate

# GraphQLエンドポイント確認
curl -X POST https://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'
```

## 関連ドキュメント

- [開発ワークフロー](./DEVELOPMENT.md) - 日常的な開発手順
- [テストガイド](./TESTING.md) - テスト戦略と実行
- [実装パターン](./PATTERNS.md) - コード実装パターン
- [セットアップガイド](./SETUP.md) - 初期環境構築
- [トラブルシューティング](./TROUBLESHOOTING.md) - 問題解決ガイド
