# セキュリティアーキテクチャ

このドキュメントでは、civicship-apiのセキュリティアーキテクチャ、認証フロー、認可システム、およびセキュリティベストプラクティスについて説明します。

## セキュリティアーキテクチャ概要

civicship-apiは4層のセキュリティアーキテクチャを採用しています：

1. **認証層** - ユーザーアイデンティティの検証
2. **GraphQL認可層** - API レベルの権限チェック
3. **Row-Level Security (RLS)** - データベースレベルの自動フィルタリング
4. **ビジネスロジック層** - ドメイン固有のアクセス制御

## 認証フロー

### 1. トークン検証

**実装ファイル:** `src/presentation/middleware/auth.ts`

```typescript
export async function createContext({ req }: { req: http.IncomingMessage }): Promise<IContext> {
  const issuer = new PrismaClientIssuer();
  const loaders: Loaders = createLoaders(issuer);
  const idToken = getIdTokenFromRequest(req);
  const communityId = (req.headers["x-community-id"] as string) || process.env.COMMUNITY_ID;

  if (!communityId) {
    throw new Error("Missing required header: x-community-id");
  }

  if (!idToken) {
    return { issuer, loaders, communityId };
  }

  const configService = container.resolve(CommunityConfigService);
  const tenantId = await configService.getFirebaseTenantId({ issuer } as IContext, communityId);

  try {
    const tenantedAuth = auth.tenantManager().authForTenant(tenantId);
    const decoded = await tenantedAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const [currentUser, hasPermissions] = await Promise.all([
      issuer.internal(async (tx) =>
        tx.user.findFirst({
          where: { identities: { some: { uid } } },
          include: userAuthInclude,
        }),
      ),
      issuer.internal(async (tx) =>
        tx.user.findFirst({
          where: { identities: { some: { uid } } },
          select: userAuthSelect,
        }),
      ),
    ]);

    return {
      issuer,
      loaders,
      uid,
      tenantId,
      communityId,
      currentUser,
      hasPermissions,
      idToken,
    };
  } catch {
    return { communityId, issuer, loaders };
  }
}
```

**機能:**
- Firebase JWT トークン検証
- コミュニティ向けマルチテナントサポート
- トークン有効期限と更新処理
- カスタムクレーム検証

### 2. ユーザーコンテキスト作成

```typescript
// データベースユーザー検索とコンテキスト作成
const createUserContext = async (decodedToken: DecodedIdToken): Promise<IContext> => {
  const user = await prisma.user.findUnique({
    where: { firebaseUid: decodedToken.uid },
    include: {
      memberships: {
        include: { community: true }
      }
    }
  });
  
  return {
    currentUser: user,
    uid: decodedToken.uid,
    isAdmin: checkAdminPermissions(user),
    hasPermissions: calculateUserPermissions(user),
    dataloaders: createDataLoaders(prismaClientIssuer),
    prisma: prismaClientIssuer
  };
};
```

### 3. 権限割り当て

```typescript
// ロールベース権限計算
const calculateUserPermissions = (user: User) => {
  const permissions = {
    memberships: user.memberships.map(membership => ({
      communityId: membership.communityId,
      role: membership.role,
      status: membership.status
    })),
    isSystemAdmin: user.isSystemAdmin || false,
    canAccessAdmin: checkAdminAccess(user)
  };
  
  return permissions;
};
```

## Row-Level Security (RLS)

**実装ファイル:** `src/infrastructure/prisma/client.ts`

### PrismaClientIssuer実装

```typescript
export class PrismaClientIssuer {
  // コミュニティメンバーのみアクセス可能
  public async onlyBelongingCommunity<T>(ctx: IContext, callback: CallbackFn<T>): Promise<T> {
    if (ctx.isAdmin) {
      return this.public(ctx, callback);
    }
    
    const user = ctx.currentUser;
    if (user) {
      return await this.client.$transaction(async (tx) => {
        await this.setRls(tx);
        await this.setRlsConfigUserId(tx, user.id);
        return await callback(tx);
      });
    }
    throw new AuthorizationError("Not authenticated");
  }
  
  // RLS設定の適用
  private async setRls(tx: Transaction) {
    await tx.$executeRawUnsafe(`SET row_security = on;`);
  }
  
  // ユーザーIDをRLS設定に設定
  private async setRlsConfigUserId(tx: Transaction, userId: string | null) {
    const [{ value }] = await tx.$queryRawUnsafe<[{ value: string }]>(
      `SELECT set_config('app.rls_config.user_id', '${userId ?? ""}', FALSE) as value;`,
    );
    return value;
  }

  // 管理者用バイパス
  public async admin<T>(ctx: IContext, callback: CallbackFn<T>): Promise<T> {
    return await this.client.$transaction(async (tx) => {
      await this.setRlsBypass(tx, true);
      return await callback(tx);
    });
  }
  
  // RLSバイパス設定
  private async setRlsBypass(tx: Transaction, bypass: boolean) {
    await tx.$queryRawUnsafe(
      `SELECT set_config('app.rls_bypass', '${bypass}', FALSE);`
    );
  }
}
```

### RLS使用例

```typescript
// 使用例: ユーザーコンテキストに基づく自動フィルタリング
const issuer = new PrismaClientIssuer();

// ユーザーがアクセス可能なコミュニティのみ取得
const communities = await issuer.onlyBelongingCommunity(context, (tx) => 
  tx.community.findMany()
);

// 管理者として全データにアクセス
const allCommunities = await issuer.admin(context, (tx) => 
  tx.community.findMany()
);
```

**利点:**
- ユーザーコンテキストに基づく自動データフィルタリング
- 不正なデータアクセスの防止
- 認可ロジックの簡素化
- 全クエリでの一貫したセキュリティ

## GraphQL認可ルール

**実装ファイル:** `src/presentation/graphql/rule.ts`

### 認可ルール実装

```typescript
import { preExecRule } from '@graphql-authz/core';

// 基本認証ルール
const IsUser = preExecRule({
  error: new AuthenticationError("User must be logged in"),
})((context: IContext) => {
  if (context.isAdmin) return true;
  return !!context.currentUser;
});

// システム管理者ルール
const IsAdmin = preExecRule({
  error: new AuthorizationError("Admin access required"),
})((context: IContext) => {
  return context.isAdmin || context.currentUser?.isSystemAdmin;
});

// コミュニティオーナールール
const IsCommunityOwner = preExecRule({
  error: new AuthorizationError("User must be community owner"),
})((context: IContext, args: { permission?: { communityId?: string } }) => {
  if (context.isAdmin) return true;
  
  const user = context.currentUser;
  const permission = args.permission;
  
  if (!user || !permission?.communityId) return false;
  
  const membership = context.hasPermissions?.memberships?.find(
    (m) => m.communityId === permission.communityId,
  );
  
  return membership?.role === Role.OWNER;
});

// 自分自身の操作ルール
const IsSelf = preExecRule({
  error: new AuthorizationError("User can only access their own data"),
})((context: IContext, args: { permission?: { userId?: string } }) => {
  if (context.isAdmin) return true;
  
  const user = context.currentUser;
  const permission = args.permission;
  
  return user?.id === permission?.userId;
});
```

### GraphQLスキーマでの適用

```typescript
// GraphQLリゾルバーでの認可ルール適用
export const permissions = shield({
  Query: {
    communities: IsUser,
    adminUsers: IsAdmin,
    userProfile: IsSelf,
  },
  Mutation: {
    createCommunity: IsUser,
    updateCommunity: IsCommunityOwner,
    deleteCommunity: IsCommunityOwner,
    promoteUser: IsCommunityOwner,
  }
});
```

### 利用可能な認可ルール

```typescript
export const rules = {
  IsUser,                 // ログイン済みユーザー
  IsAdmin,                // システム管理者
  IsSelf,                 // 自分自身の操作
  IsCommunityOwner,       // コミュニティオーナー
  IsCommunityManager,     // コミュニティマネージャー
  IsCommunityMember,      // コミュニティメンバー
  IsOpportunityOwner,     // 機会作成者
  CanReadPhoneNumber,     // 電話番号読み取り権限
} as const;
```

## APIキー認証

### 管理者エンドポイント保護

```typescript
// 管理者エンドポイント用APIキー認証
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.CIVICSHIP_ADMIN_API_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Valid API key required' 
    });
  }
  
  // 管理者コンテキストを設定
  req.isAdmin = true;
  next();
};

// 使用例
app.use('/admin', adminAuth);
app.post('/admin/users', adminController.createUser);
```

## セキュリティベストプラクティス

### 認証

- **JWTトークンを常に検証**
  - Firebase Admin SDKを使用した厳密な検証
  - トークンの有効期限チェック
  - 発行者 (issuer) の検証

- **トークンリフレッシュの適切な処理**
  - 自動トークン更新メカニズム
  - リフレッシュトークンの安全な保存
  - トークン有効期限の監視

- **マルチテナント認証**
  - テナント固有のトークン検証
  - テナント間のデータ分離
  - テナント設定の検証

### 認可

- **ロールベースアクセス制御 (RBAC)**
  - 明確なロール定義 (OWNER, MANAGER, MEMBER)
  - 最小権限の原則
  - 権限の継承と委譲

- **宣言的ルールにGraphQL shieldを使用**
  - 実行前・実行後の権限チェック
  - 組み合わせ可能な認可ルール
  - パフォーマンス向上のためのキャッシュ

- **行レベルセキュリティの適用**
  - データベースレベルでの自動フィルタリング
  - ユーザーコンテキストに基づくアクセス制御
  - 管理者バイパス機能

### データ保護

- **機密データをログに記録しない**
  - パスワード、トークン、APIキーの除外
  - 個人識別情報 (PII) の保護
  - 構造化ログでの機密データフィルタリング

- **ユーザー入力のサニタイズ**
  - GraphQL入力検証
  - SQLインジェクション防止
  - XSS攻撃対策

- **パラメータ化クエリの使用**
  - Prisma ORMによる自動パラメータ化
  - 生のSQLクエリの制限
  - 入力値の適切なエスケープ

### APIセキュリティ

- **全入力の検証**
  - GraphQLスキーマレベルの型チェック
  - ビジネスルールの検証
  - 入力サイズ制限

- **CORSの適切な実装**
  - 許可されたオリジンの明示的な設定
  - プリフライトリクエストの処理
  - 認証情報を含むリクエストの制御

- **本番環境でのHTTPS使用**
  - 全通信の暗号化
  - HSTS (HTTP Strict Transport Security) の有効化
  - セキュアクッキーの使用

- **レート制限の実装**
  - API呼び出し頻度の制限
  - DDoS攻撃の防止
  - ユーザー別・エンドポイント別の制限

### 監視とアラート

- **不審な活動の監視**
  - 失敗した認証試行の追跡
  - 異常なAPIアクセスパターンの検出
  - 権限昇格の試行監視

- **セキュリティログの記録**
  - 認証・認可イベントのログ
  - 管理者操作の監査ログ
  - セキュリティ違反の詳細記録

## 関連ドキュメント

- [アーキテクチャガイド](./ARCHITECTURE.md) - システム設計概要
- [インフラストラクチャガイド](./INFRASTRUCTURE.md) - 外部システム統合
- [実装パターン](./PATTERNS.md) - セキュリティパターンの実装例
- [環境変数ガイド](./ENVIRONMENT.md) - セキュリティ関連の環境設定
- [トラブルシューティング](TROUBLESHOOTING.md) - 認証・認可問題の解決
