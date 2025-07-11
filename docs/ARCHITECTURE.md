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
│   ├── account/        
│   │   ├── user/       # ユーザー
│   │   ├── community/  # コミュニティ
│   │   ├── membership/ # 会員
│   │   ├── wallet/     # ウォレット
│   │   └── identity/   # 認証
│   ├── experience/     
│   │   ├── opportunity/    # 募集
│   │   ├── reservation/    # 予約
│   │   ├── participation/  # 活動
│   │   └── evaluation/     # 活動評価
│   ├── content/        
│   │   ├── article/    # 記事
│   │   └── image/      # メディア
│   ├── reward/         
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

**実装:**
```typescript
// 例: src/application/domain/account/user/controller/dataloader.ts
export const userLoader = new DataLoader<string, User>(
  async (userIds) => {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } }
    });
    return userIds.map(id => users.find(user => user.id === id));
  }
);
```

**利点:**
- 複数のデータベースクエリを単一リクエストにバッチ処理
- 単一リクエストライフサイクル内での結果キャッシュ
- GraphQLクエリパフォーマンスの大幅改善

### 2. 依存性注入（tsyringe）

**目的:** クリーンな依存関係管理とテスタビリティ

**実装:**
```typescript
// 例: src/application/domain/account/user/service.ts
@injectable()
export class UserService {
  constructor(
    @inject("UserRepository") private userRepo: IUserRepository
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

**実装:**
```typescript
// 例: ユーザーコンテキストに基づく自動フィルタリング
const issuer = new PrismaClientIssuer();
const communities = await issuer.onlyBelongingCommunity.community.findMany(); // ユーザーアクセスで自動フィルタリング
```

**利点:**
- ユーザーコンテキストに基づく自動データフィルタリング
- 不正なデータアクセスの防止
- 認可ロジックの簡素化
- 全クエリでの一貫したセキュリティ

### 4. 認可ルール

**目的:** GraphQLレベルでの権限チェック

**実装:**
```typescript
// 例: src/presentation/graphql/rule.ts
export const IsUser = rule({ cache: "contextual" })(
  async (parent, args, context) => {
    return !!context.currentUser;
  }
);

export const IsCommunityOwner = rule({ cache: "contextual" })(
  async (parent, args, context) => {
    const membership = await context.dataloaders.membership.load({
      userId: context.currentUser.id,
      communityId: args.communityId
    });
    return membership?.role === "OWNER";
  }
);
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
- **Memberships:** ロール付きユーザー・コミュニティ関係
- **Identities:** マルチプラットフォーム認証（LINE、Firebase、電話）
- **Wallets:** ポイントコンテナ（コミュニティまたはメンバー所有）

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

#### マテリアライズドビュー
```sql
-- 現在のポイント残高（トリガーで更新）
CREATE MATERIALIZED VIEW mv_current_points AS
SELECT wallet_id, SUM(point_change) as current_point
FROM t_transactions
GROUP BY wallet_id;

-- 累積ポイント合計
CREATE MATERIALIZED VIEW mv_accumulated_points AS
SELECT wallet_id, SUM(CASE WHEN point_change > 0 THEN point_change ELSE 0 END) as accumulated_point
FROM t_transactions
GROUP BY wallet_id;
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
