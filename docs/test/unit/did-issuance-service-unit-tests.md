# DIDIssuanceService ユニットテスト

## 概要
DID発行サービスのユニットテスト実装について、テストパターン、モック戦略、カバレッジを詳細に説明します。

**テストファイル**: `src/__tests__/unit/account/didIssuanceService.test.ts`  
**総テストケース数**: 11

## テスト構造

### モッククラス実装
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

class MockDIDVCServerClient {
  call = jest.fn();
}

class MockIdentityService {
  fetchNewIdToken = jest.fn();
  storeAuthTokens = jest.fn();
}
```

### DIコンテナ設定
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  container.reset();

  container.register("DIDIssuanceRequestRepository", {
    useValue: mockDIDIssuanceRequestRepository,
  });
  container.register("IdentityRepository", { useValue: mockIdentityRepository });
  container.register("DIDVCServerClient", { useValue: mockClient });
  container.register("IdentityService", { useValue: mockIdentityService });

  service = container.resolve(DIDIssuanceService);
});
```

## テストケース詳細

### 1. 成功シナリオ（2テストケース）

#### 1.1 有効トークンでのDID発行成功
**テスト名**: `"should successfully request DID issuance with valid token"`

- **目的**: 有効な認証トークンを使用したDID発行の正常フローを検証
- **モック設定**: 
  - `mockClient.call.mockResolvedValue({ jobId: "job-123" })`
  - `mockDIDIssuanceRequestRepository.create.mockResolvedValue(mockDIDRequest)`
  - `mockIdentityRepository.find.mockResolvedValue(mockIdentity)`
- **検証項目**:
  - 外部API呼び出しが正しいパラメータで実行される
  - データベース更新でstatus="PROCESSING"、jobId="job-123"が設定される
  - 成功レスポンスが返される

#### 1.2 期限切れトークンのリフレッシュ後DID発行成功
**テスト名**: `"should refresh token and proceed when token is expired"`

- **目的**: トークン期限切れ時の自動リフレッシュ機能を検証
- **モック設定**:
  - 期限切れのmockIdentityを設定（`tokenExpiresAt: new Date(Date.now() - 3600000)`）
  - `mockIdentityService.fetchNewIdToken.mockResolvedValue({ idToken: "new-token", ... })`
- **検証項目**:
  - トークンリフレッシュが実行される
  - 新しいトークンで外部API呼び出しが実行される
  - DID発行が正常に完了する

### 2. 外部API失敗シナリオ（3テストケース）

#### 2.1 外部API失敗時の適切なエラーハンドリング
**テスト名**: `"should handle external API failure (null response) gracefully"`

- **目的**: 外部API失敗時の非ブロッキング動作を検証
- **モック設定**: `mockClient.call.mockResolvedValue(null)`
- **期待される動作**:
  - 外部API呼び出しが実行される
  - データベース更新でエラーメッセージとリトライカウントが記録される
  - 成功レスポンスが返される（処理は継続）
- **データベース状態検証**:
  - `errorMessage`: "External API call failed"
  - `retryCount`: { increment: 1 }

#### 2.2 トークンリフレッシュ失敗時の処理継続
**テスト名**: `"should continue processing when token refresh fails"`

- **目的**: トークンリフレッシュ失敗時でも既存トークンで処理継続することを検証
- **モック設定**:
  - 期限切れトークン設定
  - `mockIdentityService.fetchNewIdToken.mockResolvedValue(null)`
  - `mockClient.call.mockResolvedValue({ jobId: "job-123" })`
- **期待される動作**:
  - トークンリフレッシュが試行される
  - リフレッシュ失敗後、既存トークンで外部API呼び出しが実行される
  - DID発行が正常に完了する

#### 2.3 複合失敗シナリオ
**テスト名**: `"should handle both token refresh failure and external API failure"`

- **目的**: トークンリフレッシュと外部API両方の失敗時の動作を検証
- **モック設定**:
  - 期限切れトークン設定
  - `mockIdentityService.fetchNewIdToken.mockResolvedValue(null)`
  - `mockClient.call.mockResolvedValue(null)`
- **期待される動作**:
  - 両方の失敗が適切にハンドリングされる
  - エラー状態がデータベースに記録される
  - 処理は成功として完了する

### 3. トークンリフレッシュ機能（3テストケース）

#### 3.1 トークンリフレッシュ成功
**テスト名**: `"should successfully refresh auth token"`

- **目的**: 正常なトークンリフレッシュフローを検証
- **検証項目**:
  - `fetchNewIdToken`が正しいリフレッシュトークンで呼び出される
  - `storeAuthTokens`が実行される
  - 新しいトークン情報が返される

#### 3.2 トークンリフレッシュAPI失敗
**テスト名**: `"should return null when fetchNewIdToken returns null"`

- **目的**: 外部トークンリフレッシュAPI失敗時の動作を検証
- **期待される動作**: nullが返される

#### 3.3 トークンリフレッシュ例外処理
**テスト名**: `"should return null when fetchNewIdToken throws error"`

- **目的**: トークンリフレッシュ時の例外処理を検証
- **モック設定**: `mockIdentityService.fetchNewIdToken.mockRejectedValue(new Error("Token refresh failed"))`
- **期待される動作**: 例外をキャッチしてnullを返す

### 4. トークン有効性評価（3テストケース）

#### 4.1 有効トークンの検証
**テスト名**: `"should return valid token when not expired"`

- **目的**: 有効期限内トークンの正しい評価を検証
- **期待される結果**: `{ token: "valid-token", isValid: true }`

#### 4.2 期限切れトークンの検証
**テスト名**: `"should return invalid token when expired"`

- **目的**: 期限切れトークンの正しい評価を検証
- **期待される結果**: `{ token: "expired-token", isValid: false }`

#### 4.3 期限情報なしトークンの検証
**テスト名**: `"should return invalid when tokenExpiresAt is null"`

- **目的**: 期限情報がないトークンの処理を検証
- **期待される結果**: `{ token: "token", isValid: false }`

## テストデータパターン

### モックデータ設定
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

const mockDIDRequest = {
  id: "did-request-1",
  userId: mockUserId,
  status: "PENDING",
};
```

### 期限切れトークンパターン
```typescript
const expiredIdentity = {
  ...mockIdentity,
  tokenExpiresAt: new Date(Date.now() - 3600000),
};
```

## カバレッジ評価

### ✅ 十分にカバーされている領域
- **正常フロー**: 有効トークンでのDID発行
- **トークン管理**: 期限切れ検出、自動リフレッシュ、失敗処理
- **外部API失敗処理**: null レスポンス、エラーハンドリング
- **非ブロッキング動作**: 外部失敗時の処理継続
- **データベース状態管理**: エラー記録、リトライカウント

### ⚠️ 改善可能な領域
- **ネットワークエラー**: 具体的なHTTPエラーコード別テスト
- **同時実行**: 複数リクエストの競合状態テスト
- **長期リトライ**: 複数回のリトライ処理テスト
- **パフォーマンス**: 大量リクエスト時の動作テスト

## テストパターンの特徴

### モック戦略
- **Repository層**: データベース操作を完全にモック化
- **外部サービス**: DIDVCServerClientとIdentityServiceをモック化
- **依存関係注入**: tsyringeコンテナを使用した依存関係管理

### エラーハンドリングテスト
- **非ブロッキング原則**: 外部失敗が主処理を中断しない
- **適切なログ記録**: エラー状態のデータベース記録
- **グレースフルデグラデーション**: 部分的失敗時の処理継続

### テスト実行パターン
- **beforeEach**: モッククリア、コンテナリセット
- **afterEach**: モック復元
- **独立性**: 各テストが他のテストに影響しない設計

このユニットテスト実装は、DID発行サービスの堅牢性と外部API失敗に対する耐性を包括的に検証しており、プロダクション環境での信頼性を確保するための優れたテストカバレッジを提供しています。
