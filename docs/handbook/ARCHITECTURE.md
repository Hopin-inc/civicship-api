# アーキテクチャガイド

このガイドでは、civicship-api システムのアーキテクチャ、設計パターン、実装原則について説明します。

## 概要

civicship API は **ドメイン駆動設計（DDD）** と **クリーンアーキテクチャ** の原則に従い、3つの主要レイヤーで関心事を明確に分離しています。

## アーキテクチャ原則

### 1. ドメイン駆動設計（DDD）
- **ドメイン中心アプローチ:** コアドメインを中心としたビジネスロジックの整理
- **境界づけられたコンテキスト:** 異なるビジネス領域間の明確な境界
- **ドメインサービス:** ドメイン固有の操作のカプセル化

### 2. クリーンアーキテクチャ
- **依存性逆転:** 高レベルモジュールは低レベルモジュールに依存しない
- **レイヤー分離:** プレゼンテーション、アプリケーション、インフラストラクチャ間の明確な境界
- **テスタビリティ:** ビジネスロジックを独立してテストしやすい
- **フレームワーク独立性:** 外部フレームワークに依存しないビジネスロジック

## レイヤーアーキテクチャ

### 1. アプリケーション層 (`src/application/`)

**目的:** ビジネスロジックとドメイン操作

```
application/
├── domain/              # ドメイン固有のビジネスロジック
│   ├── account/        # ユーザー・コミュニティ管理（8つのサブドメイン）
│   │   ├── auth/       # 認証・LIFF統合
│   │   ├── community/  # コミュニティ作成、管理、設定
│   │   ├── identity/   # マルチプラットフォーム認証管理
│   │   ├── membership/ # ユーザー・コミュニティ関係、ロール管理
│   │   ├── nft-wallet/ # NFTウォレット機能
│   │   ├── user/       # ユーザープロファイル、認証
│   │   └── wallet/     # ポイントベースウォレットシステム
│   ├── experience/     # 機会・参加管理
│   │   ├── opportunity/    # イベント・活動作成
│   │   ├── reservation/    # 予約システム
│   │   ├── participation/  # 出席追跡
│   │   └── evaluation/     # 参加後評価
│   ├── content/        # コンテンツ管理
│   │   ├── article/    # コミュニティ記事
│   │   └── image/      # メディアアップロード・保存
│   ├── reward/         # インセンティブシステム
│   │   ├── utility/    # 交換可能な特典
│   │   └── ticket/     # ポイントベースチケット
│   ├── transaction/    # ポイント転送
│   ├── notification/   # 通知
│   └── location/       # 地理情報
├── provider.ts         # 依存性注入
└── utils.ts           # 共有関数
```

**主要特徴:**
- 純粋なビジネスロジックを含む
- 外部フレームワークから独立
- インフラストラクチャ依存関係のインターフェースを定義
- ユースケースとドメインサービスを実装

### 2. インフラストラクチャ層 (`src/infrastructure/`)

**目的:** 外部システム統合とデータ永続化

```
infrastructure/
├── prisma/             # データベース層
│   ├── schema.prisma  # データベーススキーマ定義
│   ├── migrations/    # データベースバージョン管理
│   ├── seeds/         # 初期データ投入
│   │   ├── index.ts   # シード処理オーケストレーション
│   │   ├── master.ts  # マスターデータ（都市、州）
│   │   └── domain.ts  # ビジネスデータ（ユーザー、コミュニティ）
│   ├── factories/     # テストデータ生成
│   └── client.ts      # Prismaクライアント設定
└── libs/              # 外部サービス統合
    ├── firebase.ts    # Firebase認証
    ├── storage.ts     # Google Cloud Storage
    └── did.ts         # 分散ID（IDENTUS）
```

**主要特徴:**
- アプリケーション層で定義されたインフラストラクチャインターフェースを実装
- 外部API統合を処理
- データ永続化と取得を管理
- フレームワーク固有のコードを含む

### 3. プレゼンテーション層 (`src/presentation/`)

**目的:** APIエンドポイントとリクエスト・レスポンス処理

```
presentation/
├── graphql/          
│   ├── schema/       # GraphQLスキーマ定義
│   ├── resolver/     # クエリ・ミューテーションリゾルバー
│   ├── dataloader/   # パフォーマンス最適化
│   ├── rule.ts       # 認可ルール
│   └── server.ts     # Apollo Server設定
├── middleware/       
│   ├── auth.ts      # 認証・コンテキスト作成
│   ├── cors.ts      # クロスオリジンリソース共有
│   └── logger.ts    # リクエストログ
└── router/          # RESTエンドポイント
    └── line.ts  # LINE Webhook
```

**主要特徴:**
- HTTPリクエストとレスポンスを処理
- GraphQLリゾルバーを実装
- 認証と認可を管理
- Webhook用RESTエンドポイントを提供

## ドメイン構造パターン

各ドメインは保守性とテスタビリティを促進する一貫したレイヤー構造に従います：

```
domain/
├── controller/
│   ├── resolver.ts      # GraphQL APIエンドポイント
│   └── dataloader.ts    # 効率的なデータ読み込み（N+1問題防止）
├── usecase.ts          # ビジネスロジックオーケストレーション
├── service.ts          # コアドメイン操作
├── data/
│   ├── repository.ts   # データアクセス実装
│   ├── interface.ts    # リポジトリ契約
│   ├── converter.ts    # GraphQL ↔ Prisma データ変換
│   └── type.ts         # ドメイン固有型
├── schema/             # GraphQLスキーマ定義
└── presenter.ts        # レスポンス整形
```

### レイヤー責務

#### コントローラー層
- **resolver.ts:** GraphQLクエリ・ミューテーションハンドラー
- **dataloader.ts:** パフォーマンス最適化のためのバッチデータ読み込み

#### ユースケース層
- **usecase.ts:** ビジネス操作のオーケストレーション
- サービスとリポジトリ間の調整
- 認可チェックの実装
- トランザクション境界の管理

#### サービス層
- **service.ts:** コアドメインビジネスロジック
- ドメインルールと検証の実装
- 複雑なビジネス操作の処理
- データアクセス関心事から独立

#### データ層
- **repository.ts:** データアクセス実装
- **interface.ts:** リポジトリ契約（依存性逆転）
- **converter.ts:** レイヤー間のデータ変換
- **type.ts:** ドメイン固有型定義

## 主要アーキテクチャパターン

### 1. DataLoaderパターン

**目的:** GraphQLでのN+1クエリ問題の防止
**パッケージ:** `dataloader@2.2.3`

**実装例:**
```typescript
// 実際の実装: src/application/domain/account/user/controller/dataloader.ts
export const createUserDataLoader = (issuer: PrismaClientIssuer) => {
  return new DataLoader<string, PrismaUser | null>(
    async (userIds: readonly string[]) => {
      const users = await issuer.internal((tx) =>
        tx.user.findMany({
          where: { id: { in: [...userIds] } },
        }),
      );
      return userIds.map(id => users.find(user => user.id === id) || null);
    },
  );
};

// ウォレット用DataLoader実装
export const createMemberWalletDataLoader = (issuer: PrismaClientIssuer) => {
  return new DataLoader<string, PrismaWallet | null>(
    async (userIds: readonly string[]) => {
      return issuer.internal((tx) =>
        tx.wallet.findMany({
          where: { userId: { in: [...userIds] } },
          include: { currentPointView: true },
        }),
      );
    },
  );
};
```

**利点:**
- 複数のデータベースクエリを単一リクエストにバッチ処理
- 単一リクエストライフサイクル内での結果キャッシュ
- GraphQLクエリパフォーマンスの大幅改善

### 2. 依存性注入（tsyringe）

**目的:** クリーンな依存関係管理とテスタビリティ
**パッケージ:** `tsyringe@4.10.0`
**設定ファイル:** `src/application/provider.ts`（275行の包括的DI設定）

**実装:**
```typescript
// 実際のDI設定: src/application/provider.ts
export function registerProductionDependencies() {
  // インフラストラクチャ
  container.register("prismaClient", { useValue: prismaClient });
  container.register("PrismaClientIssuer", { useClass: PrismaClientIssuer });
  
  // 全7ドメインのサービス・リポジトリ登録
  // Account Domain
  container.register("UserService", { useClass: UserService });
  container.register("UserRepository", { useClass: UserRepository });
  container.register("CommunityService", { useClass: CommunityService });
  container.register("CommunityRepository", { useClass: CommunityRepository });
  // ... 他のドメインも同様に登録
}

// サービス実装例
@injectable()
export class UserService {
  constructor(
    @inject("UserRepository") private userRepo: IUserRepository,
    @inject("PrismaClientIssuer") private issuer: PrismaClientIssuer
  ) {}
}
```

**利点:**
- コンポーネント間の疎結合
- テスト用の依存関係モックが容易
- 集中化された依存関係設定
- インターフェースベースプログラミングのサポート

### 3. RLS（PrismaClientIssuer）

**目的:** ユーザー権限に基づくデータ分離
**実装ファイル:** `src/infrastructure/prisma/client.ts`

**実装:**
```typescript
// 実際のRLS実装
export class PrismaClientIssuer {
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
}

// 使用例: ユーザーコンテキストに基づく自動フィルタリング
const issuer = new PrismaClientIssuer();
const communities = await issuer.onlyBelongingCommunity((tx) => 
  tx.community.findMany()
); // ユーザーアクセスで自動フィルタリング
```

**利点:**
- ユーザーコンテキストに基づく自動データフィルタリング
- 不正なデータアクセスの防止
- 認可ロジックの簡素化
- 全クエリでの一貫したセキュリティ

### 4. 認可ルール

**目的:** GraphQLレベルでの権限チェック
**パッケージ:** `@graphql-authz/core@1.3.2`
**実装ファイル:** `src/presentation/graphql/rule.ts`

**実装:**
```typescript
// 実際の認可ルール実装
const IsUser = preExecRule({
  error: new AuthenticationError("User must be logged in"),
})((context: IContext) => {
  if (context.isAdmin) return true;
  return !!context.currentUser;
});

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

// 利用可能な認可ルール
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

**利点:**
- 宣言的認可ルール
- 組み合わせ可能な権限チェック
- パフォーマンス向上のためのキャッシュ
- 関心事の明確な分離

## データベースアーキテクチャ

### スキーマ構成

データベーススキーマはコアビジネスエンティティを中心に構成されています：

#### ユーザー管理
- **Users:** 個人ユーザープロファイルと認証
- **Communities:** 機会をホストする組織
- **Memberships:** ロール付きユーザー・コミュニティ関係（OWNER、MANAGER、MEMBER）
- **Identities:** マルチプラットフォーム認証（LINE、Firebase、電話）
- **Wallets:** ポイントベースウォレットシステム（COMMUNITY、MEMBER）
- **NFT Wallets:** NFT機能統合

#### エクスペリエンスシステム
- **Opportunities:** イベント、活動、ボランティア募集
- **OpportunitySlots:** 開催枠
- **Reservations:** 募集開催枠の予約
- **Participations:** 実際の活動

#### 報酬システム
- **Transactions:** ウォレット間のポイント転送
- **Utilities:** コミュニティが提供する交換可能な特典
- **Tickets:** ユーティリティ交換用ポイントベースチケット

#### コンテンツ管理
- **Articles:** コミュニティ公開コンテンツ
- **Images:** GCS統合メディアファイル
- **Places:** 募集の地理的位置

#### 基盤システム
- **Community Configs:** LINEチャンネルとLIFF設定

### パフォーマンス最適化

#### マテリアライズドビューとビュー
**実装されているビュー（Prismaスキーマで定義）:**

**ポイント関連ビュー:**
- `CurrentPointView` (`mv_current_points`) - 現在のポイント残高
- `AccumulatedPointView` (`mv_accumulated_points`) - 累積ポイント合計

**場所関連ビュー:**
- `PlacePublicOpportunityCountView` - 場所別公開機会数
- `PlaceAccumulatedParticipantsView` - 場所別累積参加者数

**メンバーシップ関連ビュー:**
- `MembershipParticipationGeoView` - メンバーシップ参加地理情報
- `MembershipParticipationCountView` - メンバーシップ参加数統計
- `MembershipHostedOpportunityCountView` - ホスト機会数統計

**機会関連ビュー:**
- `EarliestReservableSlotView` - 最早予約可能スロット
- `OpportunityAccumulatedParticipantsView` - 機会別累積参加者数
- `SlotRemainingCapacityView` - スロット残容量計算

```sql
-- マテリアライズドビューのリフレッシュ（実装済み）
-- src/infrastructure/prisma/sql/refreshMaterializedViewCurrentPoints.sql
REFRESH MATERIALIZED VIEW CONCURRENTLY "mv_current_points";
```

#### データベースインデックス
- 一般的なクエリパターンに最適化
- 複雑なフィルター用の複合インデックス
- 条件付きクエリ用の部分インデックス
- 結合パフォーマンス用の外部キーインデックス

#### コネクションプーリング
- Prismaコネクション管理
- 環境に基づく設定可能なプールサイズ
- コネクションライフサイクル監視

### クエリ最適化

#### DataLoaderパターン実装
- N+1クエリを単一データベース呼び出しにバッチ処理
- リクエスト毎のキャッシュ実装
- データベース負荷の大幅削減

#### 効率的なページネーション
```typescript
// 大規模データセット用のカーソルベースページネーション
const opportunities = await prisma.opportunity.findMany({
  take: limit,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' }
});
```

## セキュリティアーキテクチャ

### 認証フロー

1. **トークン検証** → `presentation/middleware/auth.ts`
   - Firebase JWTトークン検証
   - コミュニティ向けマルチテナントサポート
   - トークン有効期限と更新処理

2. **ユーザーコンテキスト作成** → データベースユーザー検索
   - ユーザープロファイルと権限の読み込み
   - ユーザーデータでリクエストコンテキスト作成
   - リクエスト用データローダーの初期化

3. **権限割り当て** → ロールベース権限
   - コミュニティ固有のロール割り当て
   - システムレベル管理者権限
   - コンテキスト対応権限チェック

4. **リクエストコンテキスト** → リクエストライフサイクル全体で利用可能
   - 現在のユーザー情報
   - 権限フラグ
   - RLS用データベース発行者
   - パフォーマンス用データローダー

### 認可レイヤー

#### 1. GraphQLルール（実行前・実行後）
```typescript
// 実行前権限チェック
export const permissions = shield({
  Query: {
    communities: IsUser,
    adminUsers: IsSystemAdmin,
  },
  Mutation: {
    createCommunity: IsUser,
    updateCommunity: IsCommunityOwner,
  }
});
```

#### 2. RLS（データベースレベル）
```typescript
// ユーザーコンテキストに基づく自動データフィルタリング
const issuer = new PrismaClientIssuer(context.currentUser);
const communities = await issuer.onlyBelongingCommunity.community.findMany(); // アクセス可能なコミュニティのみ
```

#### 3. ビジネスロジック（ドメイン固有）
```typescript
// ドメイン固有アクセス制御
export class CommunityService {
  async updateCommunity(id: string, data: UpdateCommunityInput) {
    // ユーザーがこのコミュニティを更新する権限があるかチェック
    await this.validateUpdatePermission(id);
    return this.repository.update(id, data);
  }
}
```

#### 4. APIキー認証（管理者エンドポイント）
```typescript
// 管理者エンドポイント保護
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.CIVICSHIP_ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
```

## テストアーキテクチャ

### テスト構成

```
__tests__/
├── unit/              # 個別関数テスト
│   ├── services/     # ビジネスロジックテスト
│   ├── repositories/ # データアクセステスト
│   └── utils/        # ユーティリティ関数テスト
├── integration/       # データベース統合テスト
│   ├── graphql/      # GraphQLリゾルバーテスト
│   ├── auth/         # 認証フローテスト
│   └── database/     # データベース操作テスト
├── e2e/              # エンドツーエンドAPIテスト
│   ├── user-flows/   # 完全なユーザージャーニーテスト
│   └── admin-flows/  # 管理者操作テスト
└── fixtures/         # テストデータとユーティリティ
    ├── factories/    # テストデータ生成
    └── helpers/      # テストユーティリティ関数
```

### テストパターン

#### ファクトリーパターン（テストデータ生成）
```typescript
// 例: 一貫したテストデータ用ユーザーファクトリー
export const createUser = (overrides?: Partial<User>): User => ({
  id: faker.datatype.uuid(),
  name: faker.name.fullName(),
  email: faker.internet.email(),
  createdAt: new Date(),
  ...overrides
});
```

#### リポジトリモック（ユニットテスト分離）
```typescript
// 例: サービステスト用モックリポジトリ
const mockUserRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};
```

#### データベーストランザクション（テストデータクリーンアップ）
```typescript
// 例: 自動テストデータクリーンアップ
beforeEach(async () => {
  await prisma.$transaction(async (tx) => {
    // トランザクションでテストセットアップ
  });
});

afterEach(async () => {
  await prisma.$transaction(async (tx) => {
    // テストデータクリーンアップ
  });
});
```

#### GraphQLテスト（エンドツーエンドAPI検証）
```typescript
// 例: GraphQLミューテーションテスト
const CREATE_COMMUNITY = gql`
  mutation CreateCommunity($input: CreateCommunityInput!) {
    createCommunity(input: $input) {
      id
      name
      pointName
    }
  }
`;

test('should create community', async () => {
  const result = await client.mutate({
    mutation: CREATE_COMMUNITY,
    variables: { input: { name: 'Test Community' } }
  });
  expect(result.data.createCommunity).toBeDefined();
});
```

## デプロイメントアーキテクチャ

civicship-apiは、Google Cloud Runを使用したマルチサービス構成でデプロイされます：

### 主要サービス

1. **内部API** - メインGraphQL APIサーバー (`src/index.ts`)
2. **外部API** - パブリックウォレット操作 (`src/external-api.ts`)  
3. **バッチ処理** - バックグラウンドジョブ (`src/batch.ts`)

### インフラストラクチャ

- **Google Cloud Run** - 自動スケーリング対応
- **Artifact Registry** - Dockerイメージ管理
- **GitHub Actions** - CI/CDパイプライン
- **PostgreSQL** - SSHトンネル経由のセキュアアクセス

詳細なデプロイメント設定については、[デプロイメントガイド](DEPLOYMENT.md) を参照してください。

## パフォーマンス最適化

### 主要最適化戦略

- **DataLoaderパターン** - N+1クエリ問題の解決
- **マテリアライズドビュー** - 複雑な集計の事前計算
- **データベースインデックス** - クエリパフォーマンス向上
- **多層キャッシュ戦略** - リクエスト、アプリケーション、データベースレベル

詳細なパフォーマンス最適化については、[パフォーマンスガイド](PERFORMANCE.md) を参照してください。

## 関連ドキュメント

### 🏗️ アーキテクチャ・設計
- **[インフラストラクチャガイド](INFRASTRUCTURE.md)** - 外部システム統合、データベース設定
- **[セキュリティガイド](SECURITY.md)** - 認証・認可アーキテクチャ、4層セキュリティ
- **[デプロイメントガイド](DEPLOYMENT.md)** - マルチサービス構成、CI/CD
- **[パフォーマンスガイド](PERFORMANCE.md)** - 最適化戦略、監視・可観測性

### 📚 開発・実装
- **[開発ワークフロー](DEVELOPMENT.md)** - 日常開発手順
- **[実装パターン](PATTERNS.md)** - コードパターンとベストプラクティス
- **[テストガイド](TESTING.md)** - テスト戦略と実行

### 🔧 セットアップ・運用
- **[セットアップガイド](SETUP.md)** - 開発環境セットアップ
- **[環境変数ガイド](ENVIRONMENT.md)** - 環境設定
- **[トラブルシューティング](TROUBLESHOOTING.md)** - 問題解決ガイド

### 📋 仕様・設計
- **[機能一覧](FEATURES.md)** - ビジネス機能の詳細
- **[データベース設計](../ERD.md)** - エンティティ関係図
- **[コマンドリファレンス](COMMANDS.md)** - 全コマンド一覧
