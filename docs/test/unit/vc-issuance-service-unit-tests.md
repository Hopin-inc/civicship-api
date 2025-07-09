# VCIssuanceRequestService ユニットテスト

## 概要
VC（Verifiable Credential）発行サービスのユニットテスト実装について、テストパターン、モック戦略、カバレッジを詳細に説明します。

**テストファイル**: `src/__tests__/unit/experience/vcIssuanceService.test.ts`  
**総テストケース数**: 12

## テスト構造

### モッククラス実装
```typescript
class MockVCIssuanceRequestRepository {
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

class MockDIDIssuanceRequestRepository {
  find = jest.fn();
  create = jest.fn();
  update = jest.fn();
  query = jest.fn();
  findLatestCompletedByUserId = jest.fn();
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

  container.register("VCIssuanceRequestRepository", {
    useValue: mockVCIssuanceRequestRepository,
  });
  container.register("IdentityRepository", { useValue: mockIdentityRepository });
  container.register("DIDIssuanceRequestRepository", { useValue: mockDIDIssuanceRequestRepository });
  container.register("DIDVCServerClient", { useValue: mockClient });
  container.register("IdentityService", { useValue: mockIdentityService });
  container.register("VCIssuanceRequestConverter", { useValue: {} });

  service = container.resolve(VCIssuanceRequestService);
});
```

## テストケース詳細

### 1. 成功シナリオ（2テストケース）

#### 1.1 有効トークンでのVC発行成功
**テスト名**: `"should successfully request VC issuance with valid token"`

- **目的**: 有効な認証トークンを使用したVC発行の正常フローを検証
- **モック設定**: 
  - `mockClient.call.mockResolvedValue({ jobId: "job-123" })`
  - `mockVCIssuanceRequestRepository.create.mockResolvedValue(mockVCIssuanceRequest)`
  - `mockIdentityRepository.find.mockResolvedValue(mockIdentity)`
  - `mockDIDIssuanceRequestRepository.findLatestCompletedByUserId.mockResolvedValue({ didValue: "did:example:123456789" })`
- **検証項目**:
  - 外部API呼び出しが正しいエンドポイント（`/vc/jobs/connectionless/issue-to-holder`）で実行される
  - 正しいクレーム、認証情報フォーマット、スキーマIDが送信される
  - データベース更新でstatus="PROCESSING"、jobId="job-123"が設定される
  - 成功レスポンスが返される

#### 1.2 期限切れトークンのリフレッシュ後VC発行成功
**テスト名**: `"should refresh token and proceed when token is expired"`

- **目的**: トークン期限切れ時の自動リフレッシュ機能を検証
- **モック設定**:
  - 期限切れのmockIdentityを設定（`tokenExpiresAt: new Date(Date.now() - 3600000)`）
  - `mockIdentityService.fetchNewIdToken.mockResolvedValue({ idToken: "new-token", ... })`
- **検証項目**:
  - トークンリフレッシュが実行される
  - 新しいトークン（"new-token"）で外部API呼び出しが実行される
  - VC発行が正常に完了する

### 2. 外部API失敗シナリオ（4テストケース）

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
**テスト名**: `"should continue processing when token refresh fails but token exists"`

- **目的**: トークンリフレッシュ失敗時でも既存トークンで処理継続することを検証
- **モック設定**:
  - 期限切れトークン設定
  - `mockIdentityService.fetchNewIdToken.mockResolvedValue(null)`
  - `mockClient.call.mockResolvedValue({ jobId: "job-123" })`
- **期待される動作**:
  - トークンリフレッシュが試行される
  - リフレッシュ失敗後、既存トークンで外部API呼び出しが実行される
  - VC発行が正常に完了する

#### 2.3 認証トークン不足時の失敗処理
**テスト名**: `"should handle case when no token is available after refresh failure"`

- **目的**: 認証トークンが完全に利用できない場合の適切な失敗処理を検証
- **モック設定**:
  - `authToken: null`の設定
  - 期限切れ状態
  - `mockIdentityService.fetchNewIdToken.mockResolvedValue(null)`
- **期待される動作**:
  - 外部API呼び出しが実行されない
  - データベース更新で適切なエラー状態が記録される
  - 失敗レスポンスが返される
- **データベース状態検証**:
  - `errorMessage`: "No authentication token available"
  - `status`: "FAILED"
  - `retryCount`: { increment: 1 }
  - `processedAt`: 現在時刻

#### 2.4 DID未発見時の処理
**テスト名**: `"should handle case when no DID is found for user"`

- **目的**: ユーザーのDIDが見つからない場合の適切な処理を検証
- **モック設定**: `mockDIDIssuanceRequestRepository.findLatestCompletedByUserId.mockResolvedValue(null)`
- **期待される動作**:
  - 外部API呼び出しが実行されない
  - データベース更新でPENDING状態が維持される
  - 失敗レスポンスが返される
- **データベース状態検証**:
  - `status`: "PENDING"
  - `processedAt`: 現在時刻

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
- **期待される結果**: `{ token: null, isValid: false }`

## テストデータパターン

### VC発行リクエストデータ
```typescript
const mockVCRequest: EvaluationCredentialPayload = {
  claims: {
    type: "EvaluationCredential",
    score: EvaluationStatus.PASSED,
    evaluator: {
      id: "evaluator-1",
      name: "Test Evaluator",
    },
    participant: {
      id: "participant-1",
      name: "Test Participant",
    },
    opportunity: {
      id: "opportunity-1",
      title: "Test Opportunity",
    },
  },
  credentialFormat: "JWT",
  schemaId: "schema-123",
};
```

### モックアイデンティティデータ
```typescript
const mockIdentity = {
  uid: mockPhoneUid,
  authToken: mockToken,
  refreshToken: mockRefreshToken,
  tokenExpiresAt: new Date(Date.now() + 3600000),
};
```

### 失敗状態パターン
```typescript
// 認証トークンなし
const identityWithoutToken = {
  ...mockIdentity,
  authToken: null,
  tokenExpiresAt: new Date(Date.now() - 3600000),
};

// 期限切れトークン
const expiredIdentity = {
  ...mockIdentity,
  tokenExpiresAt: new Date(Date.now() - 3600000),
};
```

## カバレッジ評価

### ✅ 十分にカバーされている領域
- **正常フロー**: 有効トークンでのVC発行
- **トークン管理**: 期限切れ検出、自動リフレッシュ、失敗処理
- **外部API失敗処理**: null レスポンス、エラーハンドリング
- **非ブロッキング動作**: 外部失敗時の処理継続
- **前提条件チェック**: DID存在確認、認証トークン確認
- **データベース状態管理**: エラー記録、リトライカウント、ステータス管理

### ⚠️ 改善可能な領域
- **VC形式バリエーション**: JWT以外の認証情報フォーマットテスト
- **スキーマ検証**: 無効なスキーマIDでのテスト
- **同時実行**: 複数VC発行リクエストの競合状態テスト
- **長期リトライ**: 複数回のリトライ処理テスト
- **評価データバリエーション**: 異なる評価結果でのVC発行テスト

## VCサービス特有の特徴

### DID依存関係
- **DID前提条件**: VC発行前にDIDが完了している必要がある
- **DID検索**: `findLatestCompletedByUserId`でユーザーの最新完了DIDを取得
- **DID未発見処理**: DIDが見つからない場合の適切な失敗処理

### 評価データ統合
- **評価クレーム**: 評価者、参加者、機会情報を含む包括的なクレーム
- **評価結果**: PASSED/FAILEDステータスの適切な処理
- **評価ID関連付け**: 特定の評価IDとVC発行リクエストの関連付け

### エラー状態の詳細化
- **FAILED状態**: 認証トークン不足時の明確な失敗状態
- **PENDING状態**: DID未発見時の待機状態
- **PROCESSING状態**: 外部API成功時の処理中状態

## テストパターンの特徴

### 複合依存関係テスト
- **複数Repository**: VC、Identity、DIDIssuanceRequestの3つのRepositoryを統合
- **外部サービス統合**: DIDVCServerClientとIdentityServiceの両方をモック化
- **前提条件チェック**: DID存在とトークン有効性の両方を検証

### 失敗シナリオの網羅性
- **段階的失敗**: トークンリフレッシュ失敗 → 既存トークン使用 → 外部API失敗
- **完全失敗**: 認証トークン完全不足時の適切な失敗処理
- **前提条件失敗**: DID未発見時の適切な待機状態設定

このユニットテスト実装は、VC発行サービスの複雑な依存関係と多段階の失敗シナリオを包括的に検証しており、評価プロセスにおけるVC発行の信頼性を確保するための優れたテストカバレッジを提供しています。
