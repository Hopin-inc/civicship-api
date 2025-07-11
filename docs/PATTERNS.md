# 実装パターンとベストプラクティス

このドキュメントでは、civicship-apiプロジェクトで使用される重要な実装パターン、アーキテクチャパターン、およびベストプラクティスについて説明します。

## アーキテクチャパターン

### ドメイン構造パターン

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

### 依存性注入パターン

```typescript
// src/application/provider.ts
import { container } from "tsyringe";

// サービスの登録
container.registerSingleton<IUserRepository>(
  "UserRepository", 
  UserRepository
);

container.registerSingleton<UserService>(
  "UserService", 
  UserService
);

// 使用例
@injectable()
export class UserService {
  constructor(
    @inject("UserRepository") private userRepository: IUserRepository
  ) {}
}
```

## パフォーマンス最適化パターン

### DataLoaderパターン

N+1クエリ問題を解決するためのDataLoader実装:

```typescript
// src/application/domain/your-domain/controller/dataloader.ts
import DataLoader from 'dataloader';

export const createUserDataLoader = (context: IContext) => {
  return new DataLoader<string, User>(async (userIds) => {
    const users = await context.prisma.user.findMany({
      where: { id: { in: userIds as string[] } }
    });
    
    // IDの順序を保持してマッピング
    return userIds.map(id => 
      users.find(user => user.id === id) || null
    );
  });
};

// GraphQLリゾルバーでの使用
export const communityResolver = {
  Community: {
    members: async (community, args, context) => {
      const membershipIds = await context.dataloaders.communityMemberships
        .load(community.id);
      return context.dataloaders.user.loadMany(membershipIds);
    }
  }
};
```

### データベース最適化パターン

1. **関連データの効率的な取得:**
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

2. **インデックスの活用:**
   ```prisma
   model User {
     id    String @id
     email String @unique
     
     @@index([email])
     @@index([createdAt])
   }
   ```

3. **マテリアライズドビューの使用:**
   ```sql
   -- パフォーマンス最適化のためのビュー
   CREATE MATERIALIZED VIEW mv_current_points AS
   SELECT 
     wallet_id,
     SUM(amount) as current_balance
   FROM transactions
   GROUP BY wallet_id;
   ```

## セキュリティパターン

### Row-Level Security (RLS) パターン

```typescript
// src/infrastructure/prisma/client.ts
export class PrismaClientIssuer {
  // コミュニティメンバーのみアクセス可能
  onlyBelongingCommunity(userId: string, communityId: string) {
    return this.prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // RLSルールを適用
            return query({
              ...args,
              where: {
                ...args.where,
                community: { 
                  memberships: { 
                    some: { userId, status: 'JOINED' } 
                  } 
                }
              }
            });
          }
        }
      }
    });
  }
}
```

### GraphQL認可パターン

```typescript
// src/presentation/graphql/rule.ts
import { rule, shield, and, or } from 'graphql-shield';

const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, context) => {
    return context.currentUser !== null;
  }
);

const isCommunityOwner = rule({ cache: 'strict' })(
  async (parent, args, context) => {
    const membership = await context.prisma.membership.findFirst({
      where: {
        userId: context.currentUser.id,
        communityId: args.communityId,
        role: 'OWNER'
      }
    });
    return !!membership;
  }
);

export const permissions = shield({
  Query: {
    community: isAuthenticated,
  },
  Mutation: {
    updateCommunity: and(isAuthenticated, isCommunityOwner),
  }
});
```

## エラーハンドリングパターン

### サービス層のエラーハンドリング

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

### GraphQLリゾルバーのエラーハンドリング

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

## ログ記録パターン

### 構造化ログ記録

```typescript
import { logger } from '../infrastructure/logger';

// 異なるログレベル
logger.debug('Debug information', { userId, action });
logger.info('User created successfully', { userId });
logger.warn('Deprecated API used', { endpoint });
logger.error('Database connection failed', { error });
```

### 本番環境ログ記録のベストプラクティス

- **機密データのログ記録を避ける**（パスワード、トークン）
- **一貫したフィールドで構造化ログを使用**
- **リクエスト追跡のための相関IDを含める**
- **監視のためのパフォーマンスメトリクスをログ**

### リクエストトレーシングパターン

```typescript
// リクエストタイミングミドルウェア
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

## GraphQL最適化パターン

### フィールドレベルキャッシング

```typescript
const resolvers = {
  User: {
    communities: async (user, args, context) => {
      return context.dataloaders.userCommunities.load(user.id);
    }
  }
};
```

### クエリ複雑度分析

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

## 命名規則パターン

### ファイルとディレクトリ

- **ファイル:** kebab-case (`user-service.ts`)
- **ディレクトリ:** kebab-case (`user-management/`)
- **テストファイル:** `*.test.ts` または `*.spec.ts`

### コード要素

- **変数/関数:** camelCase (`getUserById`)
- **クラス:** PascalCase (`UserService`)
- **定数:** UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **インターフェース:** 'I'プレフィックス付きPascalCase (`IUserRepository`)
- **型:** PascalCase (`UserCreateInput`)

### GraphQLスキーマ

- **型:** PascalCase (`User`, `Community`)
- **フィールド:** camelCase (`firstName`, `createdAt`)
- **列挙型:** UPPER_SNAKE_CASE (`USER_ROLE`)
- **入力型:** サフィックス付きPascalCase (`CreateUserInput`)

## 認証・認可パターン

### Firebase認証統合

```typescript
// Firebase認証の検証
const verifyFirebaseToken = async (token: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new AuthenticationError('Invalid token');
  }
};
```

### マルチテナント認証

```typescript
// テナント固有の認証
const verifyTenantToken = async (token: string, tenantId: string) => {
  const auth = admin.auth().tenantManager().authForTenant(tenantId);
  return await auth.verifyIdToken(token);
};
```

## データ変換パターン

### GraphQL ↔ Prisma変換

```typescript
// src/application/domain/user/data/converter.ts
export class UserConverter {
  static toGraphQL(prismaUser: PrismaUser): GraphQLUser {
    return {
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      createdAt: prismaUser.createdAt.toISOString()
    };
  }
  
  static toPrisma(graphqlInput: CreateUserInput): PrismaUserCreateInput {
    return {
      name: graphqlInput.name,
      email: graphqlInput.email,
      // GraphQLからPrismaへの変換ロジック
    };
  }
}
```

## 監視とデバッグパターン

### パフォーマンス監視

```typescript
// データベースクエリ監視
const queryMiddleware = async (params, next) => {
  const start = Date.now();
  const result = await next(params);
  const duration = Date.now() - start;
  
  if (duration > 1000) {
    logger.warn('Slow query detected', {
      model: params.model,
      action: params.action,
      duration
    });
  }
  
  return result;
};
```

### メモリ使用量監視

```bash
# メモリ使用量の監視
node --inspect pnpm dev:https
# chrome://inspectを開く
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

## 関連ドキュメント

- [開発ワークフロー](./DEVELOPMENT.md) - 日常的な開発手順
- [テストガイド](./TESTING.md) - テスト戦略と実行
- [コマンドリファレンス](./COMMANDS.md) - 全コマンド一覧
- [アーキテクチャガイド](./ARCHITECTURE.md) - システム設計概要
