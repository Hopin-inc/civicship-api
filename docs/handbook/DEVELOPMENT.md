# 開発ワークフロー

このガイドでは、civicship-apiへの貢献のための日常的な開発手順とワークフローについて説明します。

## 日常開発コマンド

### 開発開始

```bash
# 開発セッションを開始
cd civicship-api

# 最新のdevelopブランチにいることを確認
git checkout develop
git pull origin develop

# データベースコンテナを開始（実行されていない場合）
pnpm container:up

# ホットリロード付き開発サーバーを開始
pnpm dev:https
```

### 基本的な開発コマンド

```bash
# リンティング実行（ESLint + Prettier自動修正）
pnpm lint

# テスト実行
pnpm test

# データベース内容を表示
pnpm db:studio

# GraphQL型生成
pnpm gql:generate

# Prismaクライアント生成
pnpm db:generate
```

**詳細なコマンドについては [コマンドリファレンス](COMMANDS.md) を参照してください。**

## 開発ワークフロー

### 1. 機能開発

#### 新しい機能ブランチの作成

```bash
# developから機能ブランチを作成
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# またはバグ修正の場合
git checkout -b fix/your-bug-fix-name
```

#### 開発プロセス

1. **変更を計画:**
   - 要件を理解する
   - 影響を受けるドメインを特定する
   - 必要に応じてデータベーススキーマ変更を計画する

2. **変更を実装:**
   - ドメイン駆動設計の原則に従う
   - 一貫したレイヤー構造を維持する
   - 開発しながらテストを書く

3. **変更をテスト:**
   ```bash
   # 関連テストを実行
   pnpm test -- --testPathPattern=your-feature
   
   # 全テストを実行
   pnpm test
   
   # GraphQLエンドポイントをテスト
   # https://localhost:3000/graphql でApollo Server（introspection有効）を使用
   # 注意: GraphQL Playgroundは利用できません
   # Apollo Studio、Insomnia、Postman等のクライアントを使用
   ```

4. **コード品質チェック:**
   ```bash
   # リンティング問題を修正（ESLint + Prettier自動修正）
   pnpm lint
   
   # TypeScript型チェック（手動実行）
   npx tsc --noEmit
   
   # 全テストが通ることを確認
   pnpm test
   ```

### 2. データベーススキーマ変更

データベーススキーマの変更手順については、[コマンドリファレンス](COMMANDS.md) の「データベース操作」セクションを参照してください。

基本的な流れ：
1. `src/infrastructure/prisma/schema.prisma` を編集
2. `pnpm db:migrate` でマイグレーション作成
3. `pnpm db:generate` でPrismaクライアント再生成
4. `pnpm gql:generate` でGraphQL型更新

### 3. GraphQLスキーマ変更

GraphQLスキーマの変更とベストプラクティスについては、[実装パターン](../PATTERNS.md) の「GraphQL最適化パターン」セクションを参照してください。

### 4. テスト戦略

テストの記述方法、ファクトリーパターンの使用については、[テストガイド](../TESTING.md) を参照してください。

### 5. コードレビュープロセス

#### PR提出前チェックリスト

**基本チェック:**
- [ ] 全テストが通る (`pnpm test`)
- [ ] リンティングが通る (`pnpm lint`)
- [ ] 型チェックが通る (`npx tsc --noEmit`)
- [ ] ドキュメントが更新されている

**品質チェック:**
- [ ] console.log文がない
- [ ] 適切なエラーハンドリング
- [ ] セキュリティ考慮事項が対応されている
- [ ] ドメイン駆動設計に従っている

#### プルリクエスト作成

```bash
# 変更をコミット
git add src/ docs/
git commit -m "feat: add new feature description"

# リモートにプッシュ
git push origin feature/your-feature-name

# GitHub CLIでPR作成
gh pr create --title "Add new feature" --body "Description of changes"
```

## 実装パターンとベストプラクティス

コード構成パターン、命名規則、エラーハンドリング、ログ記録、パフォーマンス最適化、セキュリティベストプラクティスについては、[実装パターン](../PATTERNS.md) を参照してください。

## デバッグと監視

デバッグ方法、パフォーマンス監視、ログ確認については、[コマンドリファレンス](COMMANDS.md) の「デバッグ・監視コマンド」セクションを参照してください。

## 関連ドキュメント

### 📚 詳細ガイド
- **[テストガイド](../TESTING.md)** - テスト戦略、ファクトリーパターン、テストデータ管理
- **[実装パターン](../PATTERNS.md)** - DataLoader、DI、RLS、エラーハンドリング、セキュリティパターン
- **[コマンドリファレンス](COMMANDS.md)** - 全pnpmコマンド、デバッグ、環境別実行方法

### 🔧 セットアップ・運用
- **[セットアップガイド](../SETUP.md)** - 初期環境構築手順
- **[環境変数設定](ENVIRONMENT.md)** - 環境変数の詳細設定
- **[トラブルシューティング](../TROUBLESHOOTING.md)** - よくある問題と解決方法

### 🏗️ アーキテクチャ・設計
- **[アーキテクチャガイド](ARCHITECTURE.md)** - システム設計とドメイン構造
- **[機能一覧](../FEATURES.md)** - ビジネス機能の詳細
- **[データベース設計](../ERD.md)** - エンティティ関係図
