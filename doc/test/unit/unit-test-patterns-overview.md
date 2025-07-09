# DID/VC ユニットテストパターン概要

## 概要
DID/VCサービスのユニットテスト実装における共通パターン、モック戦略、テスト設計原則について包括的に説明します。

## 実装済みユニットテスト一覧

### 1. DIDIssuanceService
- **ファイル**: `src/__tests__/unit/account/didIssuanceService.test.ts`
- **テスト数**: 11
- **カバレッジ**: DID発行、トークン管理、外部API失敗処理

### 2. VCIssuanceRequestService  
- **ファイル**: `src/__tests__/unit/experience/vcIssuanceService.test.ts`
- **テスト数**: 12
- **カバレッジ**: VC発行、評価データ統合、DID依存関係処理

### 3. DIDVCServerClient
- **ファイル**: `src/__tests__/unit/infrastructure/libs/didVCServerClient.test.ts`
- **テスト数**: 10
- **カバレッジ**: HTTP通信、エラーハンドリング、全HTTPメソッド

## 共通テストパターン

### 1. モッククラス設計パターン

#### Repository層モック
```typescript
class MockDIDIssuanceRequestRepository {
  find = jest.fn();
  create = jest.fn();
  update = jest.fn();
  query = jest.fn();
}

class MockIdentityRepository {
  find = jest.fn();
  create = jest.fn();
  update = jest.fn();
}
```

#### 外部サービスモック
```typescript
class MockDIDVCServerClient {
  call = jest.fn();
}

class MockIdentityService {
  fetchNewIdToken = jest.fn();
  storeAuthTokens = jest.fn();
}
```

### 2. 依存関係注入パターン

#### DIコンテナ設定
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  container.reset();

  // Repository層の注入
  container.register("DIDIssuanceRequestRepository", {
    useValue: mockDIDIssuanceRequestRepository,
  });
  container.register("IdentityRepository", { 
    useValue: mockIdentityRepository 
  });

  // 外部サービス層の注入
  container.register("DIDVCServerClient", { 
    useValue: mockClient 
  });
  container.register("IdentityService", { 
    useValue: mockIdentityService 
  });

  // テスト対象サービスの解決
  service = container.resolve(DIDIssuanceService);
});
```

#### クリーンアップパターン
```typescript
afterEach(() => {
  jest.restoreAllMocks();
});
```

### 3. テストデータ管理パターン

#### 基本モックデータ
```typescript
const mockCtx = { currentUser: { id: "user-1" } };
const mockUserId = "user-1";
const mockPhoneUid = "phone-uid-123";
const mockToken = "valid-token";
const mockRefreshToken = "refresh-token-123";
```

#### アイデンティティデータ
```typescript
const mockIdentity = {
  uid: mockPhoneUid,
  platform: IdentityPlatform.PHONE,
  userId: mockUserId,
  communityId: "community-1",
  authToken: mockToken,
  refreshToken: mockRefreshToken,
  tokenExpiresAt: new Date(Date.now() + 3600000),
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

#### 期限切れデータパターン
```typescript
const expiredIdentity = {
  ...mockIdentity,
  tokenExpiresAt: new Date(Date.now() - 3600000),
};
```

## テストシナリオ分類

### 1. 成功シナリオ
- **有効トークンでの正常処理**
- **期限切れトークンの自動リフレッシュ後処理**
- **適切なレスポンス形式の検証**

### 2. 外部API失敗シナリオ
- **外部API null レスポンス処理**
- **トークンリフレッシュ失敗時の処理継続**
- **複合失敗シナリオ（トークン + API失敗）**

### 3. 認証・トークン管理シナリオ
- **トークン有効性評価**
- **トークンリフレッシュ成功/失敗**
- **認証トークン不足時の処理**

### 4. エラーハンドリングシナリオ
- **ネットワークエラー処理**
- **HTTPエラー（400/500番台）処理**
- **タイムアウトエラー処理**

## モック戦略の原則

### 1. 依存関係の分離
- **Repository層**: データベース操作を完全にモック化
- **外部サービス**: HTTP通信や外部API呼び出しをモック化
- **内部ロジック**: サービス層のビジネスロジックは実装を使用

### 2. テスト独立性の確保
- **beforeEach**: 各テスト前にモックをクリア
- **container.reset()**: DIコンテナの状態をリセット
- **jest.clearAllMocks()**: Jest モックの状態をクリア

### 3. 現実的なモック設定
- **実際のデータ構造**: プロダクションと同じデータ形式を使用
- **エラーパターン**: 実際に発生しうるエラー状況を再現
- **タイミング**: 非同期処理の適切なモック化

## エラーハンドリングテスト原則

### 1. 非ブロッキング動作の検証
- **外部失敗時の処理継続**: 外部API失敗が主処理を中断しない
- **適切なログ記録**: エラー状態のデータベース記録
- **グレースフルデグラデーション**: 部分的失敗時の処理継続

### 2. エラー状態の一貫性
- **統一されたエラーメッセージ**: "External API call failed"
- **リトライカウント管理**: `{ increment: 1 }` パターン
- **ステータス管理**: PENDING/PROCESSING/FAILED の適切な設定

### 3. 例外処理パターン
- **try/catch の適切な使用**: 例外をキャッチしてnullを返す
- **エラー再スロー防止**: 上位層への例外伝播を防ぐ
- **ログレベル管理**: warn/error レベルでの適切なログ出力

## テスト実行パターン

### 1. セットアップ・クリーンアップ
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  container.reset();
  // モック設定
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

### 2. 非同期テスト処理
```typescript
it("should handle async operation", async () => {
  // モック設定
  mockService.method.mockResolvedValue(expectedValue);
  
  // テスト実行
  const result = await service.method();
  
  // 検証
  expect(result).toEqual(expectedResult);
});
```

### 3. モック検証パターン
```typescript
// 呼び出し回数の検証
expect(mockService.method).toHaveBeenCalledTimes(1);

// 引数の検証
expect(mockService.method).toHaveBeenCalledWith(
  expectedParam1,
  expectedParam2
);

// 呼び出し順序の検証
expect(mockService.method1).toHaveBeenCalledBefore(mockService.method2);
```

## カバレッジ評価基準

### ✅ 十分にカバーされている領域
- **正常フロー**: 基本的な成功シナリオ
- **エラーハンドリング**: 主要な失敗パターン
- **トークン管理**: 認証関連の処理
- **外部API統合**: HTTP通信とエラー処理

### ⚠️ 改善可能な領域
- **エッジケース**: 境界値や特殊条件
- **パフォーマンス**: 大量データや同時実行
- **セキュリティ**: 認証・認可の詳細テスト
- **統合シナリオ**: 複数サービス間の連携

## ベストプラクティス

### 1. テスト設計原則
- **単一責任**: 1つのテストで1つの機能を検証
- **独立性**: テスト間の依存関係を排除
- **再現性**: 同じ条件で同じ結果を保証
- **可読性**: テストの意図が明確に理解できる

### 2. モック設計原則
- **最小限のモック**: 必要最小限の依存関係のみモック化
- **現実的なデータ**: プロダクション環境に近いテストデータ
- **エラーシミュレーション**: 実際に発生しうるエラーパターン
- **状態管理**: モックの状態を適切に管理

### 3. 保守性の確保
- **共通パターンの抽出**: 再利用可能なモッククラス
- **設定の外部化**: 環境変数やコンフィグファイルの活用
- **ドキュメント化**: テストの目的と期待値の明記
- **継続的改善**: カバレッジレポートに基づく改善

## 今後の改善提案

### 1. テストカバレッジ拡張
- **統合テストとの連携**: ユニットテストと統合テストの適切な分離
- **エンドツーエンドシナリオ**: 実際のユーザーフローに基づくテスト
- **パフォーマンステスト**: 負荷テストとベンチマーク

### 2. テストインフラ強化
- **自動化**: CI/CDパイプラインでの自動テスト実行
- **レポート**: カバレッジレポートと品質メトリクス
- **モニタリング**: テスト実行時間とリソース使用量の監視

### 3. 開発プロセス統合
- **TDD/BDD**: テスト駆動開発の導入
- **コードレビュー**: テストコードの品質レビュー
- **継続的リファクタリング**: テストコードの保守性向上

このユニットテストパターン概要は、DID/VCサービスの堅牢性と保守性を確保するための包括的なガイドラインを提供し、開発チーム全体でのテスト品質向上に貢献します。
