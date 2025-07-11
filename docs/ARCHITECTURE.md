# アーキテクチャガイド

このガイドでは、civicship-api システムのアーキテクチャ、設計パターン、実装原則について包括的に説明します。

## 概要

Civicship API は **ドメイン駆動設計（DDD）** と **クリーンアーキテクチャ** の原則に従い、3つの主要レイヤーで関心事を明確に分離しています。このシステムは、ポイントベースの報酬システムとLINEメッセージング統合を備えたコミュニティエンゲージメントプラットフォームをサポートするよう設計されています。

## アーキテクチャ原則

### 1. ドメイン駆動設計（DDD）
- **ドメイン中心アプローチ:** コアドメインを中心としたビジネスロジックの整理
- **ユビキタス言語:** コードとドキュメント全体での一貫した用語使用
- **境界づけられたコンテキスト:** 異なるビジネス領域間の明確な境界
- **ドメインサービス:** ドメイン固有の操作のカプセル化

### 2. クリーンアーキテクチャ
- **依存性逆転:** 高レベルモジュールは低レベルモジュールに依存しない
- **レイヤー分離:** プレゼンテーション、アプリケーション、インフラストラクチャ間の明確な境界
- **テスタビリティ:** ビジネスロジックを独立してテストしやすい
- **フレームワーク独立性:** 外部フレームワークに依存しないビジネスロジック

### 3. SOLID原則
- **単一責任原則:** 各クラスは変更する理由を1つだけ持つ
- **開放閉鎖原則:** 拡張に対して開いており、修正に対して閉じている
- **リスコフ置換原則:** サブタイプは基底タイプで置換可能でなければならない
- **インターフェース分離原則:** クライアントは使用しないインターフェースに依存すべきでない
- **依存性逆転原則:** 具象ではなく抽象に依存する

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
│   ├── transaction/    # ポイント転送・金融操作
│   ├── notification/   # LINEメッセージング・リッチメニュー
│   └── location/       # 地理データ管理
├── provider.ts         # 依存性注入設定
└── utils.ts           # 共有ユーティリティ
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
│   │   ├── master/    # マスターデータ（都市、州）
│   │   └── domain/    # ビジネスデータ（ユーザー、コミュニティ）
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
├── graphql/           # GraphQL API
│   ├── schema/       # GraphQLスキーマ定義
│   ├── resolver/     # クエリ・ミューテーションリゾルバー
│   ├── dataloader/   # パフォーマンス最適化
│   ├── rule.ts       # 認可ルール
│   └── server.ts     # Apollo Server設定
├── middleware/       # リクエスト処理
│   ├── auth.ts      # 認証・コンテキスト作成
│   ├── cors.ts      # クロスオリジンリソース共有
│   └── logger.ts    # リクエストログ
└── router/          # RESTエンドポイント
    └── line-webhook.ts  # LINEメッセージングWebhook
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

### 3. 行レベルセキュリティ（PrismaClientIssuer）

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
- **Opportunities:** イベント、活動、ボランティア機会
- **OpportunitySlots:** 容量制限付きの特定時間枠
- **Reservations:** 機会スロットのユーザー予約
- **Participations:** 実際の参加追跡とステータス

#### 報酬システム
- **Wallets:** ポイントコンテナ（コミュニティまたはメンバー所有）
- **Transactions:** ウォレット間のポイント転送
- **Utilities:** コミュニティが提供する交換可能な特典
- **Tickets:** ユーティリティ交換用ポイントベースチケット

#### コンテンツ管理
- **Articles:** コミュニティ公開コンテンツ
- **Images:** GCS統合メディアファイル
- **Places:** 機会の地理的位置

#### 通知システム
- **Community Configs:** LINEチャンネルとLIFF設定
- **Rich Menus:** ロールベースLINEインターフェースカスタマイゼーション

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

#### 2. 行レベルセキュリティ（データベースレベル）
```typescript
// ユーザーコンテキストに基づく自動データフィルタリング
const issuer = new PrismaClientIssuer(context.currentUser);
const communities = await issuer.community.findMany(); // アクセス可能なコミュニティのみ
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

### マルチサービスデプロイメント

アプリケーションは複数のデプロイメント構成をサポートします：

#### 1. 内部API（メインサービス）
- **エントリーポイント:** `src/index.ts`
- **目的:** メインGraphQL APIサーバー
- **Dockerfile:** `Dockerfile`
- **デプロイメント:** Google Cloud Run

#### 2. 外部API（パブリックウォレット操作）
- **エントリーポイント:** `src/external-api.ts`
- **目的:** パブリックウォレット操作と外部統合
- **Dockerfile:** `Dockerfile.external`
- **デプロイメント:** Google Cloud Run（別サービス）

#### 3. バッチ処理（バックグラウンドジョブ）
- **エントリーポイント:** `src/batch.ts`
- **目的:** バックグラウンドジョブ処理
- **Dockerfile:** `Dockerfile.batch`
- **デプロイメント:** Google Cloud Run Jobs

### インフラストラクチャコンポーネント

#### Google Cloud Run
- **自動スケーリング:** リクエスト量に基づく
- **コンテナレジストリ:** DockerイメージのArtifact Registry
- **環境変数:** Cloud Run設定を通じて管理
- **ヘルスチェック:** 組み込みヘルス監視

#### データベースアクセス
- **SSHトンネル:** ビルド時のジャンプボックス経由セキュアデータベースアクセス
- **コネクションプーリング:** Prismaコネクション管理
- **SSL/TLS:** 暗号化データベース接続

#### CI/CDパイプライン
- **GitHub Actions:** 自動ビルドとデプロイメント
- **マルチ環境:** 開発・ステージング・本番の分離デプロイメント
- **セキュリティスキャン:** コンテナ脆弱性スキャン
- **自動テスト:** ユニット・統合・E2Eテスト

## パフォーマンス考慮事項

### クエリ最適化
- **DataLoaderパターン:** データベースクエリのバッチ処理とキャッシュ
- **マテリアライズドビュー:** 事前計算された集計
- **データベースインデックス:** 一般的なクエリパターンに最適化
- **コネクションプーリング:** 効率的なデータベース接続管理

### キャッシュ戦略
- **リクエストレベルキャッシュ:** 単一リクエスト内のDataLoaderキャッシュ
- **アプリケーションレベルキャッシュ:** セッションと一時データ用Redis
- **データベースレベルキャッシュ:** PostgreSQLクエリ結果キャッシュ
- **CDNキャッシュ:** GCS経由の静的アセット配信

### 監視と可観測性
- **アプリケーションメトリクス:** ビジネス操作用カスタムメトリクス
- **データベース監視:** クエリパフォーマンスと接続メトリクス
- **エラー追跡:** 包括的なエラーログとアラート
- **パフォーマンス監視:** リクエスト遅延とスループット追跡

## 関連ドキュメント

- [ドメイン詳細](./DOMAINS.md) - 詳細なドメイン構造とビジネスロジック
- [実装パターン](./PATTERNS.md) - コードパターンとベストプラクティス
- [セットアップガイド](./SETUP.md) - 開発環境セットアップ
- [開発ワークフロー](./DEVELOPMENT.md) - 日常開発手順
- [テストガイド](./TESTING.md) - テスト戦略と実行
