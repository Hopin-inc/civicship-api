# テスト戦略とガイド

このドキュメントでは、civicship-apiプロジェクトにおけるテスト戦略、テストの記述方法、ファクトリーパターンの使用について説明します。

## テスト戦略

### テストタイプ

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

**注意:** `pnpm test:integration`, `pnpm test:e2e` コマンドは現在利用できません。代わりに上記のパターンマッチングを使用してください。

## テストの記述

### 1. サービステスト

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

### 2. GraphQLテスト

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

## テストデータ管理

### Prisma Fabbricaファクトリーの使用

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

### テストデータのクリーンアップ

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

## ファクトリーパターンの詳細

### 基本的な使用方法

```typescript
// 基本的なエンティティ作成
const user = await UserFactory.create();
const community = await CommunityFactory.create();

// カスタムデータでの作成
const adminUser = await UserFactory.create({
  name: 'Admin User',
  email: 'admin@example.com'
});

// 関連データを含む作成
const membershipWithRelations = await MembershipFactory.create({
  transientUser: user,
  transientCommunity: community,
  transientRole: Role.OWNER,
  transientStatus: MembershipStatus.JOINED
});
```

### 複雑なテストシナリオ

```typescript
// コミュニティとメンバーシップを含む完全なテストデータ
const setupCommunityWithMembers = async () => {
  const owner = await UserFactory.create();
  const community = await CommunityFactory.create();
  
  const ownerMembership = await MembershipFactory.create({
    transientUser: owner,
    transientCommunity: community,
    transientRole: Role.OWNER,
    transientStatus: MembershipStatus.JOINED
  });
  
  const members = await Promise.all([
    UserFactory.create(),
    UserFactory.create(),
    UserFactory.create()
  ]);
  
  const memberMemberships = await Promise.all(
    members.map(member => 
      MembershipFactory.create({
        transientUser: member,
        transientCommunity: community,
        transientRole: Role.MEMBER,
        transientStatus: MembershipStatus.JOINED
      })
    )
  );
  
  return {
    owner,
    community,
    members,
    ownerMembership,
    memberMemberships
  };
};
```

## テスト環境設定

### 環境変数

```bash
# テストデータベースとモックサービスを使用
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:15432/civicship_test
```

### Jest設定

テスト設定は `jest.config.cjs` と `jest.setup.ts` で管理されています：

- **Firebase認証のモック化**
- **Prisma Fabbricaの初期化**
- **テストデータベースの設定**
- **グローバルテストヘルパーの設定**

### テスト実行コマンド

```bash
# 全テスト実行
pnpm test

# カバレッジ付きテスト実行
pnpm test:coverage

# 特定のパターンでテスト実行
pnpm test -- --testPathPattern=user

# ウォッチモード（手動実行）
npx jest --watch

# 特定のテストファイル実行
pnpm test -- __tests__/unit/account/user.service.test.ts
```

## テストのベストプラクティス

### 1. テスト構造

- **Arrange-Act-Assert** パターンを使用
- **Given-When-Then** 形式でテストケースを記述
- **明確で説明的なテスト名**を使用

### 2. モックとスタブ

```typescript
// リポジトリのモック
const mockUserRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
} as jest.Mocked<IUserRepository>;

// サービスの依存性注入
const userService = new UserService(mockUserRepository);
```

### 3. 非同期テスト

```typescript
// Promise ベースのテスト
it('should handle async operations', async () => {
  const result = await userService.createUser(userData);
  expect(result).toBeDefined();
});

// エラーハンドリングのテスト
it('should throw error for invalid data', async () => {
  await expect(userService.createUser(invalidData))
    .rejects
    .toThrow('Invalid user data');
});
```

### 4. GraphQL テスト

```typescript
// GraphQL クエリテスト
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

it('should return user data', async () => {
  const user = await UserFactory.create();
  const { data } = await client.query({
    query: GET_USER,
    variables: { id: user.id }
  });
  
  expect(data.user).toMatchObject({
    id: user.id,
    name: user.name,
    email: user.email
  });
});
```

## トラブルシューティング

### よくある問題

1. **ファクトリーが見つからない**
   ```bash
   # ファクトリーが正しくインポートされているか確認
   import { UserFactory } from '@/infrastructure/prisma/factories/factory';
   ```

2. **テストデータベース接続エラー**
   ```bash
   # テストデータベースが起動しているか確認
   pnpm container:up
   ```

3. **Firebase認証エラー**
   ```bash
   # jest.setup.ts でモックが正しく設定されているか確認
   ```

### デバッグ方法

```bash
# デバッグモードでテスト実行
DEBUG=* pnpm test

# 特定のテストをデバッグ
node --inspect-brk node_modules/.bin/jest --runInBand your-test-file.test.ts
```

## 関連ドキュメント

- [開発ワークフロー](./DEVELOPMENT.md) - 日常的な開発手順
- [実装パターン](./PATTERNS.md) - コード実装パターン
- [コマンドリファレンス](./COMMANDS.md) - 全コマンド一覧
- [トラブルシューティング](./TROUBLESHOOTING.md) - 問題解決ガイド
