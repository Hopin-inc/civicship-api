# 開発ワークフロー

このガイドでは、civicship-apiへの貢献のための日常的な開発手順、ベストプラクティス、ワークフローについて説明します。

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

### コード品質チェック

```bash
# リンティング実行（ESLint + Prettier自動修正）
pnpm lint

# テスト実行
pnpm test

# カバレッジ付きテスト実行
pnpm test:coverage

# 注意: 以下のコマンドは現在利用できません
# - pnpm test:watch
# - pnpm lint:graphql  
# - pnpm type-check
# 
# 代替手段:
# - TypeScript型チェック: npx tsc --noEmit
# - GraphQLスキーマ検証: pnpm gql:generate でエラーチェック
```

### データベース操作

```bash
# データベース内容を表示
pnpm db:studio

# スキーマ変更後のPrismaクライアント生成（スキーマフォーマット + 生成）
pnpm db:generate

# 新しいマイグレーション作成（作成のみ、適用は別途）
pnpm db:migrate

# マイグレーションをデータベースに適用
pnpm db:deploy

# データベースリセット（注意 - 全データ削除！）
pnpm db:migrate-reset

# 新しいデータでデータベースをシード
pnpm db:seed-master    # 都市・州データ
pnpm db:seed-domain    # ユーザー・コミュニティデータ

# データベーススキーマをPrismaスキーマに反映
pnpm db:pull

# マイグレーション巻き戻しマーク
pnpm db:mark-rolled-back
```

### GraphQL操作

```bash
# スキーマ変更後のGraphQL型生成（codegen.yamlに基づく）
pnpm gql:generate

# 注意: 以下のコマンドは現在利用できません
# - pnpm gql:validate
# - pnpm gql:diff
#
# GraphQLスキーマ検証は以下の方法で実行:
# 1. pnpm gql:generate でコード生成エラーをチェック
# 2. 開発サーバー起動時のスキーマ検証エラーを確認
# 3. Apollo Server の introspection 機能を使用（開発環境のみ）
```

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

#### スキーマ変更の実行

1. **Prismaスキーマを更新:**
   ```bash
   # src/infrastructure/prisma/schema.prismaを編集
   nano src/infrastructure/prisma/schema.prisma
   ```

2. **マイグレーションを生成:**
   ```bash
   # マイグレーションファイルを作成（作成のみ）
   pnpm db:migrate
   
   # 作成されたマイグレーションファイルを確認・編集
   # src/infrastructure/prisma/migrations/ 配下に生成される
   ```

3. **アプリケーションコードを更新:**
   ```bash
   # Prismaクライアントを再生成
   pnpm db:generate
   
   # TypeScript型を更新
   pnpm gql:generate
   ```

4. **必要に応じてシードを更新:**
   ```bash
   # シードファイルを編集
   nano src/infrastructure/prisma/seeds/domain/your-domain.ts
   
   # シードをテスト
   pnpm db:migrate-reset
   pnpm db:seed-master
   pnpm db:seed-domain
   ```

#### マイグレーションのベストプラクティス

- **適用前に生成されたマイグレーションを必ず確認**
- **本番前にサンプルデータでマイグレーションをテスト**
- **複雑なマイグレーションのロールバック計画を作成**
- **スキーマ変更のドキュメントを更新**

### 3. GraphQLスキーマ変更

#### 新しい型/フィールドの追加

1. **GraphQLスキーマを定義:**
   ```bash
   # ドメイン固有のスキーマファイルを編集
   nano src/application/domain/your-domain/schema/your-type.graphql
   ```

2. **型を生成:**
   ```bash
   pnpm gql:generate
   ```

3. **リゾルバーを実装:**
   ```typescript
   // src/application/domain/your-domain/controller/resolver.ts
   export const yourResolver = {
     Query: {
       yourQuery: async (parent, args, context) => {
         // 実装
       }
     }
   };
   ```

4. **必要に応じてDataLoaderを追加:**
   ```typescript
   // src/application/domain/your-domain/controller/dataloader.ts
   export const yourDataLoader = new DataLoader(async (ids) => {
     // バッチローディング実装
   });
   ```

#### GraphQLのベストプラクティス

- **N+1クエリを防ぐためにDataLoaderを使用**
- **適切な認可ルールを実装**
- **命名規則に従う**（フィールドはcamelCase）
- **適切なエラーハンドリングを追加**
- **複雑なクエリにコメントを記述**

### 4. テスト戦略

#### テストタイプ

1. **ユニットテスト:**
   ```bash
   # 個別の関数/サービスをテスト
   pnpm test -- --testPathPattern=unit
   ```

2. **統合テスト:**
   ```bash
   # データベース相互作用をテスト
   pnpm test -- --testPathPattern=integration
   ```

3. **認証テスト:**
   ```bash
   # GraphQL認可ルールをテスト
   pnpm test -- --testPathPattern=auth
   ```

# 注意: pnpm test:integration, pnpm test:e2e コマンドは現在利用できません
# 代わりに上記のパターンマッチングを使用してください

#### テストの記述

1. **サービステスト:**
   ```typescript
   // __tests__/unit/services/user.service.test.ts
   describe('UserService', () => {
     let userService: UserService;
     let mockRepository: jest.Mocked<IUserRepository>;
   
     beforeEach(() => {
       mockRepository = createMockRepository();
       userService = new UserService(mockRepository);
     });
   
     it('should create user', async () => {
       const userData = createUserData();
       const result = await userService.createUser(userData);
       expect(result).toBeDefined();
     });
   });
   ```

2. **GraphQLテスト:**
   ```typescript
   // __tests__/integration/graphql/user.test.ts
   describe('User GraphQL', () => {
     it('should query user by id', async () => {
       const user = await createTestUser();
       const query = gql`
         query GetUser($id: ID!) {
           user(id: $id) {
             id
             name
             email
           }
         }
       `;
       
       const result = await client.query({
         query,
         variables: { id: user.id }
       });
       
       expect(result.data.user).toMatchObject({
         id: user.id,
         name: user.name
       });
     });
   });
   ```

#### テストデータ管理

1. **Prisma Fabbricaファクトリーを使用:**
   ```typescript
   // src/infrastructure/prisma/factories/factory.ts から実際のファクトリーを使用
   import { 
     UserFactory, 
     CommunityFactory, 
     MembershipFactory 
   } from '@/infrastructure/prisma/factories/factory';
   import { Role, MembershipStatus } from '@prisma/client';

   // ユーザーを作成（LINE認証付き）
   const user = await UserFactory.create();

   // コミュニティを作成（ウォレット自動作成）
   const community = await CommunityFactory.create();

   // 関連データを作成（transientフィールド使用）
   const membership = await MembershipFactory.create({
     transientUser: user,
     transientCommunity: community,
     transientRole: Role.MEMBER,
     transientStatus: MembershipStatus.JOINED,
   });

   // 複数データ作成
   const users = await UserFactory.createList(5);
   ```

2. **テストデータのクリーンアップ:**
   ```typescript
   // jest.setup.ts で設定済み
   // - Firebase認証モック
   // - Prisma Fabbrica初期化
   // - テストデータベース設定

   // テストヘルパー使用例
   import { createApolloTestServer } from '@/__tests__/helper/test-server';

   const mockContext = {
     currentUser: { id: 'test-user-id' },
     uid: 'test-user-id',
     // ... その他のコンテキスト
   };

   const app = await createApolloTestServer(mockContext);
   ```

### 5. コードレビュープロセス

#### PR提出前

1. **セルフレビューチェックリスト:**
   - [ ] 全テストが通る
   - [ ] リンティングが通る
   - [ ] 型チェックが通る
   - [ ] ドキュメントが更新されている
   - [ ] console.log文がない
   - [ ] 適切なエラーハンドリング
   - [ ] セキュリティ考慮事項が対応されている

2. **パフォーマンスチェックリスト:**
   - [ ] 関連データにDataLoaderを使用
   - [ ] データベースクエリが最適化されている
   - [ ] N+1クエリ問題がない
   - [ ] 新しいクエリに適切なインデックス

3. **コード品質チェックリスト:**
   - [ ] ドメイン駆動設計に従っている
   - [ ] 既存パターンと一貫している
   - [ ] 適切な関心の分離
   - [ ] 明確な変数/関数名
   - [ ] 複雑なロジックに適切なコメント

#### プルリクエスト作成

```bash
# 全変更がコミットされていることを確認
git add .
git commit -m "feat: add new feature description"

# リモートにプッシュ
git push origin feature/your-feature-name

# GitHub CLIまたはWebインターフェースでPR作成
gh pr create --title "Add new feature" --body "Description of changes"
```

#### PR説明テンプレート

```markdown
## 説明
実施した変更の簡潔な説明。

## 変更タイプ
- [ ] バグ修正
- [ ] 新機能
- [ ] 破壊的変更
- [ ] ドキュメント更新

## テスト
- [ ] ユニットテスト追加/更新
- [ ] 統合テスト追加/更新
- [ ] 手動テスト完了

## チェックリスト
- [ ] コードがプロジェクトスタイルガイドラインに従っている
- [ ] セルフレビュー完了
- [ ] ローカルでテストが通る
- [ ] ドキュメント更新済み
```

## コード構成パターン

### ドメイン構造

確立されたドメインパターンに従う:

```
src/application/domain/your-domain/
├── controller/
│   ├── resolver.ts      # GraphQLリゾルバー
│   └── dataloader.ts    # データローディング最適化
├── usecase.ts          # ビジネスロジック統制
├── service.ts          # コアドメイン操作
├── data/
│   ├── repository.ts   # データアクセス実装
│   ├── interface.ts    # リポジトリ契約
│   ├── converter.ts    # データ変換
│   └── type.ts         # ドメイン型
├── schema/             # GraphQLスキーマファイル
└── presenter.ts        # レスポンス整形
```

### 命名規則

#### ファイルとディレクトリ
- **ファイル:** kebab-case (`user-service.ts`)
- **ディレクトリ:** kebab-case (`user-management/`)
- **テストファイル:** `*.test.ts` または `*.spec.ts`

#### コード要素
- **変数/関数:** camelCase (`getUserById`)
- **クラス:** PascalCase (`UserService`)
- **定数:** UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **インターフェース:** 'I'プレフィックス付きPascalCase (`IUserRepository`)
- **型:** PascalCase (`UserCreateInput`)

#### GraphQLスキーマ
- **型:** PascalCase (`User`, `Community`)
- **フィールド:** camelCase (`firstName`, `createdAt`)
- **列挙型:** UPPER_SNAKE_CASE (`USER_ROLE`)
- **入力型:** サフィックス付きPascalCase (`CreateUserInput`)

### エラーハンドリング

#### サービス層
```typescript
export class UserService {
  async createUser(data: CreateUserInput): Promise<User> {
    try {
      // 入力を検証
      await this.validateUserData(data);
      
      // ビジネスロジック
      const user = await this.repository.create(data);
      
      return user;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new UserInputError(error.message);
      }
      
      // 予期しないエラーをログ
      logger.error('Failed to create user', { error, data });
      throw new InternalServerError('User creation failed');
    }
  }
}
```

#### GraphQLリゾルバー
```typescript
export const userResolver = {
  Mutation: {
    createUser: async (parent, args, context) => {
      try {
        return await context.services.user.createUser(args.input);
      } catch (error) {
        // GraphQLエラーハンドリングミドルウェアに処理を委ねる
        throw error;
      }
    }
  }
};
```

### ログ記録

#### 開発時ログ記録
```typescript
import { logger } from '../infrastructure/logger';

// 異なるログレベル
logger.debug('Debug information', { userId, action });
logger.info('User created successfully', { userId });
logger.warn('Deprecated API used', { endpoint });
logger.error('Database connection failed', { error });
```

#### 本番環境ログ記録
- **機密データのログ記録を避ける**（パスワード、トークン）
- **一貫したフィールドで構造化ログを使用**
- **リクエスト追跡のための相関IDを含める**
- **監視のためのパフォーマンスメトリクスをログ**

## 実際のコマンド一覧（package.json準拠）

### 利用可能なpnpmコマンド

```bash
# 開発・ビルド
pnpm dev              # HTTP開発サーバー
pnpm dev:https        # HTTPS開発サーバー  
pnpm dev:external     # 外部API開発サーバー
pnpm build            # TypeScriptコンパイル + GraphQLコピー
pnpm start            # プロダクション起動
pnpm copy-graphql     # GraphQLファイルのみコピー

# コード品質
pnpm lint             # ESLint + Prettier（自動修正）
pnpm test             # Jest テスト実行
pnpm test:coverage    # カバレッジ付きテスト

# データベース
pnpm db:pull          # スキーマをPrismaに反映
pnpm db:generate      # Prismaクライアント生成
pnpm db:migrate       # マイグレーション作成
pnpm db:deploy        # マイグレーション適用
pnpm db:migrate-reset # データベースリセット
pnpm db:studio        # Prisma Studio起動
pnpm db:seed-master   # マスターデータシード
pnpm db:seed-domain   # ドメインデータシード
pnpm db:mark-rolled-back # マイグレーション巻き戻しマーク

# GraphQL
pnpm gql:generate     # GraphQL型生成

# Docker
pnpm container:up     # PostgreSQLコンテナ起動
pnpm container:down   # コンテナ停止・削除
```

### 利用できないコマンド（ドキュメント修正済み）

以下のコマンドは現在package.jsonに存在しません:
- `pnpm lint:graphql`
- `pnpm gql:validate`
- `pnpm gql:diff`
- `pnpm type-check`
- `pnpm test:integration`
- `pnpm test:watch`
- `pnpm db:reset`

## 環境管理

### 開発環境

```bash
# 開発固有の設定を使用
NODE_ENV=development
DEBUG=prisma:query,graphql:*
LOG_LEVEL=debug
```

### テスト環境

```bash
# テストデータベースとモックサービスを使用
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:15432/civicship_test
```

### 本番環境

```bash
# 本番設定を使用
NODE_ENV=production
LOG_LEVEL=info
# 全シークレットは環境変数から
```

## パフォーマンス最適化

### データベース最適化

1. **DataLoaderを使用:**
   ```typescript
   // 関連クエリをバッチ処理
   const users = await context.dataloaders.user.loadMany(userIds);
   ```

2. **クエリを最適化:**
   ```typescript
   // 単一クエリで関連データを含める
   const user = await prisma.user.findUnique({
     where: { id },
     include: {
       memberships: {
         include: {
           community: true
         }
       }
     }
   });
   ```

3. **データベースインデックスを使用:**
   ```prisma
   model User {
     id    String @id
     email String @unique
     
     @@index([email])
     @@index([createdAt])
   }
   ```

### GraphQL最適化

1. **フィールドレベルキャッシングを実装:**
   ```typescript
   const resolvers = {
     User: {
       communities: async (user, args, context) => {
         return context.dataloaders.userCommunities.load(user.id);
       }
     }
   };
   ```

2. **クエリ複雑度分析を使用:**
   ```typescript
   const server = new ApolloServer({
     typeDefs,
     resolvers,
     plugins: [
       depthLimit(10),
       costAnalysis({ maximumCost: 1000 })
     ]
   });
   ```

## セキュリティベストプラクティス

### 認証
- **JWTトークンを常に検証**
- **トークンの有効期限をチェック**
- **トークン発行者を検証**
- **トークンリフレッシュを適切に処理**

### 認可
- **ロールベースアクセス制御を実装**
- **宣言的ルールにGraphQL shieldを使用**
- **行レベルセキュリティを適用**
- **複数レイヤーでユーザー権限を検証**

### データ保護
- **機密データをログに記録しない**
- **ユーザー入力をサニタイズ**
- **パラメータ化クエリを使用**
- **レート制限を実装**

### APIセキュリティ
- **全入力を検証**
- **CORSを適切に実装**
- **本番環境でHTTPSを使用**
- **不審な活動を監視**

## 監視とデバッグ

### ローカルデバッグ

1. **デバッガーを使用:**
   ```bash
   # デバッガーで開始
   node --inspect-brk dist/index.js
   ```

2. **デバッグログを有効化:**
   ```bash
   DEBUG=* pnpm dev:https
   ```

3. **GraphQL開発ツールを使用:**
   - Apollo Server（introspection有効、開発環境のみ）
   - https://localhost:3000/graphql でスキーマ確認
   - Apollo Studio、Insomnia、Postman等のクライアントでテスト
   - 注意: GraphQL Playgroundは利用できません

4. **Winston ログ出力:**
   ```bash
   # ログファイル確認
   tail -f logs/app.log
   
   # Google Cloud Logging（本番環境）
   # @google-cloud/logging-winston で自動送信
   ```

### パフォーマンス監視

1. **データベースクエリ監視:**
   ```bash
   DEBUG=prisma:query pnpm dev:https
   ```

2. **メモリ使用量監視:**
   ```bash
   node --inspect pnpm dev:https
   # chrome://inspectを開く
   ```

3. **リクエストトレーシング:**
   ```typescript
   // リクエストタイミングミドルウェアを追加
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       logger.info('Request completed', {
         method: req.method,
         url: req.url,
         duration,
         status: res.statusCode
       });
     });
     next();
   });
   ```

## デプロイメント準備

### デプロイ前チェックリスト

- [ ] 全テストが通る
- [ ] リンティングが通る
- [ ] 型チェックが通る
- [ ] データベースマイグレーションがテスト済み
- [ ] 環境変数が設定済み
- [ ] セキュリティレビューが完了
- [ ] パフォーマンステストが完了
- [ ] ドキュメントが更新済み

### ビルドプロセス

```bash
# クリーンビルド
rm -rf dist/
pnpm build

# 本番ビルドをテスト
NODE_ENV=production node dist/index.js

# 本番テストを実行
NODE_ENV=production pnpm test
```

## 関連ドキュメント

- [セットアップガイド](./SETUP.md) - 初期環境セットアップ
- [アーキテクチャガイド](./ARCHITECTURE.md) - システム設計概要
- [テストガイド](./TESTING.md) - テスト戦略と実行
- [トラブルシューティング](./TROUBLESHOOTING.md) - よくある問題と解決方法
