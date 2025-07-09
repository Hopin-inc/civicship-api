# 外部API失敗シナリオ

## 概要
DID/VC統合テスト全体で実装された外部API失敗パターンとノンブロッキングエラーハンドリング戦略の包括的文書化。

## 失敗シミュレーションパターン

### 1. API呼び出し失敗（null返却）
**パターン**:
```typescript
mockDIDVCClient.call.mockResolvedValue(null);
```

- **使用ケース**: HTTP 400/500エラー、ネットワーク失敗、サービス停止をシミュレーション
- **実装**: 外部サービスクライアントが例外をスローする代わりに`null`を返す
- **期待されるレスポンス**: サービスがメインフローを中断することなくnullレスポンスを適切に処理
- **適用先**: 
  - SignUp DID統合テスト（API失敗シナリオ）
  - VC評価統合テスト（外部API失敗シナリオ）

### 2. APIタイムアウトシミュレーション
**パターン**:
```typescript
mockDIDVCClient.call.mockImplementation(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), 100);
  });
});
```

- **使用ケース**: 遅い外部サービスレスポンスとタイムアウト条件をシミュレーション
- **タイムアウト処理**: 遅延後の適切な劣化を伴うノンブロッキング
- **実装詳細**:
  - 100ms遅延がネットワーク遅延をシミュレーション
  - タイムアウト後に`null`を返して失敗をシミュレーション
  - メイン処理が無限に待機することなく継続
- **適用先**:
  - SignUpテスト: "should create user successfully when DID external API times out"
  - VCテスト: "should handle VC external API timeout gracefully"

### 3. 複数の同時失敗
**パターン**:
```typescript
mockDIDVCClient.call.mockResolvedValue(null);
// すべての外部APIが同時にnullを返すように設定
```

- **使用ケース**: カスケード外部サービス失敗下でのシステム回復力をテスト
- **システム動作**: 複数の失敗にもかかわらずコアビジネスロジックが中断されることなく継続
- **検証**: 外部サービス依存関係に単一障害点がないことを確保
- **適用先**:
  - SignUpテスト: "should handle multiple external API failures simultaneously"
  - VCテスト: "should handle multiple external API failures simultaneously"

### 4. 成功したAPIレスポンス（制御ケース）
**パターン**:
```typescript
mockDIDVCClient.call.mockResolvedValue({ jobId: "test-job-id" });
```

- **使用ケース**: 外部APIが正しく機能する場合の通常動作を検証
- **期待される動作**: 適切なジョブ追跡を伴う完全な機能
- **データベース状態**: 入力されたジョブIDを持つPROCESSINGステータス

## データベース状態管理

### 成功状態パターン
外部API呼び出しが成功した場合:
```typescript
// 期待されるデータベース状態
{
  status: "PROCESSING",
  jobId: "test-job-id",           // 外部サービスジョブ識別子で入力
  errorMessage: null,             // エラーが記録されない
  retryCount: 0,                  // リトライが不要
  processedAt: new Date(),        // 成功した処理のタイムスタンプ
}
```

### 失敗状態パターン
外部API呼び出しが失敗した場合:
```typescript
// 期待されるデータベース状態
{
  status: "PENDING",
  jobId: null,                    // 失敗によりジョブが作成されない
  errorMessage: "External API call failed",  // 標準化されたエラーメッセージ
  retryCount: 1,                  // リトライ処理のために増加
  processedAt: null,              // 成功した処理タイムスタンプなし
}
```

### 状態遷移パターン
1. **初期状態**: デフォルト値でリクエストが作成される
2. **処理状態**: 外部APIが呼び出され、進行を反映するようにステータスが更新される
3. **成功状態**: APIが成功し、ジョブIDが記録され、ステータスがPROCESSINGに設定される
4. **失敗状態**: APIが失敗し、エラーが記録され、リトライカウントが増加し、ステータスがPENDINGのまま

## エラーハンドリング戦略

### ノンブロッキング原則
1. **外部API失敗がメインビジネスフローを中断することはない**
   - DID APIステータスに関係なくユーザー作成が完了
   - VC API失敗にもかかわらず評価とポイント転送が進行
   - 外部サービス停止中もコア機能が利用可能

2. **適切なレベルでエラーがログに記録される**
   - 予期される外部サービス失敗にはwarnレベル
   - 予期しないシステム失敗にはerrorレベル
   - 成功した外部API相互作用にはinfoレベル

3. **データベースレコードがリトライ処理のために失敗状態を維持**
   - 失敗したリクエストが増加したリトライカウントでマークされる
   - デバッグと監視のためにエラーメッセージが保存される
   - ステータスフィールドがバッチ処理でリトライ候補を特定可能にする

4. **ユーザー向け操作が正常に完了**
   - 外部サービス失敗に対するユーザー可視エラーなし
   - 外部依存関係によってメインアプリケーション機能が影響を受けない
   - 外部機能が利用できない場合の適切な劣化

### リトライメカニズム設計

#### 即座のリトライハンドリング
- 失敗したリクエストが`retryCount: 1`でマークされる
- リトライ適格性を示すためにステータスが`PENDING`のまま
- デバッグのためにエラーメッセージが保持される

#### バッチ処理統合
- バックグラウンドジョブがリトライのためのPENDINGリクエストを特定
- 各試行でリトライカウントが増加
- 無限ループを防ぐために最大リトライ制限が強制される

#### 長期リトライ戦略
- リトライ間隔の指数バックオフ
- 持続的失敗のためのサーキットブレーカーパターン
- 持続的問題のための手動介入トリガー

## 実装パターン

### サービス層エラーハンドリング
```typescript
// DID/VCサービスで使用されるパターン
try {
  const response = await this.didvcClient.call(uid, token, endpoint, method, data);
  if (!response) {
    // nullレスポンス（API失敗）を処理
    await this.markIssuanceStatus(requestId, "PENDING", "External API call failed", retryCount + 1);
    return;
  }
  // 成功したレスポンスを処理
  await this.markIssuanceStatus(requestId, "PROCESSING", null, 0, response.jobId);
} catch (error) {
  // 予期しないエラーを処理
  logger.error("Unexpected error in external API call", error);
  await this.markIssuanceStatus(requestId, "PENDING", "External API call failed", retryCount + 1);
}
```

### クライアント層エラーハンドリング
```typescript
// DIDVCServerClientで使用されるパターン
async call(uid: string, token: string, endpoint: string, method: string, data: any): Promise<any | null> {
  try {
    const response = await axios({
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: { Authorization: `Bearer ${token}` },
      data,
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    logger.warn(`外部API呼び出し失敗（ノンブロッキング）`, {
      uid, endpoint, method,
      error: error instanceof Error ? error.message : String(error),
    });
    return null; // ノンブロッキング失敗レスポンス
  }
}
```

## テスト検証パターン

### データベース状態アサーション
```typescript
// 失敗状態を検証するための標準パターン
const request = await TestDataSourceHelper.findDIDIssuanceRequest(userId);
expect(request).toBeDefined();
expect(request?.status).toBe("PENDING");
expect(request?.errorMessage).toBe("External API call failed");
expect(request?.retryCount).toBe(1);
expect(request?.jobId).toBeNull();
```

### API呼び出し検証
```typescript
// API相互作用を検証するための標準パターン
expect(mockDIDVCClient.call).toHaveBeenCalledWith(
  expect.stringMatching(/test-phone-uid-/),
  "test-phone-auth-token",
  "/did/jobs/connectionless/create",
  "POST",
  expect.objectContaining({
    // 期待されるリクエストペイロード構造
  })
);
```

### ノンブロッキング動作検証
```typescript
// 外部失敗にもかかわらずメインフローが完了することを検証
const result = await useCase.userCreateAccount(ctx, input);
expect(result.user).toBeDefined();
expect(result.membership?.status).toBe(MembershipStatus.ACTIVE);

// 外部API失敗ハンドリングを別途検証
const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(result.user!.id);
expect(didRequest?.status).toBe("PENDING");
```

## カバレッジ評価

### ✅ 十分にカバーされているシナリオ
- **基本的な失敗パターン**: null返却とタイムアウトの包括的カバレッジ
- **データベース状態管理**: すべての失敗タイプにわたる一貫したパターン
- **ノンブロッキング動作**: メインフロー保護の徹底的検証
- **エラーメッセージ標準化**: サービス全体での統一されたエラーハンドリング
- **リトライカウント管理**: 失敗したリクエストの適切な増加パターン

### ⚠️ カバレッジギャップ
- **複雑なリトライシナリオ**: リトライカウント進行（1、2、3など）の限定的テスト
- **カスケード失敗ハンドリング**: サービス間の失敗伝播の最小限テスト
- **持続的失敗下でのパフォーマンス**: 拡張停止シナリオの負荷テストなし
- **サーキットブレーカーパターン**: 自動失敗検出と回復のテストなし
- **監視とアラート**: エラーログとアラートシステムの限定的検証

## 強化されたカバレッジの推奨事項

### 高優先度強化
1. **拡張リトライシナリオテスト**
   - 複数の失敗を通じたリトライカウント進行をテスト
   - 複数のリトライ後の最終的な成功を検証
   - 最大リトライ制限の強制をテスト

2. **持続的失敗テスト**
   - 拡張外部サービス停止中のシステム動作をテスト
   - 持続的失敗下でのリソース使用量とパフォーマンスを検証
   - 外部サービスが正常に戻った時の回復動作をテスト

### 中優先度強化
3. **複雑な統合テスト**
   - 複数の外部サービスにわたる失敗組み合わせをテスト
   - エラー相関とデバッグ機能を検証
   - 手動介入と回復手順をテスト

4. **監視と可観測性テスト**
   - エラーログの完全性と正確性を検証
   - アラートしきい値と通知システムをテスト
   - 外部API失敗のメトリクス収集を検証

この包括的な外部API失敗ハンドリング戦略は、外部依存関係がさまざまなタイプの失敗を経験しても堅牢なシステム動作を確保し、テストと検証のための明確なパターンを維持します。
- **Expected Behavior**: Full functionality with proper job tracking
- **Database State**: PROCESSING status with populated job ID

## Database State Management

### Success State Pattern
When external API calls succeed:
```typescript
// Expected database state
{
  status: "PROCESSING",
  jobId: "test-job-id",           // Populated with external service job identifier
  errorMessage: null,             // No error recorded
  retryCount: 0,                  // No retries needed
  processedAt: new Date(),        // Timestamp of successful processing
}
```

### Failure State Pattern
When external API calls fail:
```typescript
// Expected database state
{
  status: "PENDING",
  jobId: null,                    // No job created due to failure
  errorMessage: "External API call failed",  // Standardized error message
  retryCount: 1,                  // Incremented for retry processing
  processedAt: null,              // No successful processing timestamp
}
```

### State Transition Patterns
1. **Initial State**: Request created with default values
2. **Processing State**: External API called, status updated to reflect progress
3. **Success State**: API succeeds, job ID recorded, status set to PROCESSING
4. **Failure State**: API fails, error recorded, retry count incremented, status remains PENDING

## Error Handling Strategy

### Non-blocking Principles
1. **External API failures never interrupt main business flows**
   - User creation completes regardless of DID API status
   - Evaluation and point transfers proceed despite VC API failures
   - Core functionality remains available during external service outages

2. **Errors are logged at appropriate levels**
   - Warn level for expected external service failures
   - Error level for unexpected system failures
   - Info level for successful external API interactions

3. **Database records maintain failure state for retry processing**
   - Failed requests marked with incremented retry count
   - Error messages stored for debugging and monitoring
   - Status fields enable batch processing to identify retry candidates

4. **User-facing operations complete successfully**
   - No user-visible errors for external service failures
   - Main application functionality unaffected by external dependencies
   - Graceful degradation when external features unavailable

### Retry Mechanism Design

#### Immediate Retry Handling
- Failed requests marked with `retryCount: 1`
- Status remains `PENDING` to indicate retry eligibility
- Error message preserved for debugging

#### Batch Processing Integration
- Background jobs identify PENDING requests for retry
- Retry count incremented with each attempt
- Maximum retry limits enforced to prevent infinite loops

#### Long-term Retry Strategy
- Exponential backoff for retry intervals
- Circuit breaker patterns for sustained failures
- Manual intervention triggers for persistent issues

## Implementation Patterns

### Service Layer Error Handling
```typescript
// Pattern used in DID/VC services
try {
  const response = await this.didvcClient.call(uid, token, endpoint, method, data);
  if (!response) {
    // Handle null response (API failure)
    await this.markIssuanceStatus(requestId, "PENDING", "External API call failed", retryCount + 1);
    return;
  }
  // Handle successful response
  await this.markIssuanceStatus(requestId, "PROCESSING", null, 0, response.jobId);
} catch (error) {
  // Handle unexpected errors
  logger.error("Unexpected error in external API call", error);
  await this.markIssuanceStatus(requestId, "PENDING", "External API call failed", retryCount + 1);
}
```

### Client Layer Error Handling
```typescript
// Pattern used in DIDVCServerClient
async call(uid: string, token: string, endpoint: string, method: string, data: any): Promise<any | null> {
  try {
    const response = await axios({
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: { Authorization: `Bearer ${token}` },
      data,
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    logger.warn(`External API call failed (non-blocking)`, {
      uid, endpoint, method,
      error: error instanceof Error ? error.message : String(error),
    });
    return null; // Non-blocking failure response
  }
}
```

## Test Validation Patterns

### Database State Assertions
```typescript
// Standard pattern for validating failure state
const request = await TestDataSourceHelper.findDIDIssuanceRequest(userId);
expect(request).toBeDefined();
expect(request?.status).toBe("PENDING");
expect(request?.errorMessage).toBe("External API call failed");
expect(request?.retryCount).toBe(1);
expect(request?.jobId).toBeNull();
```

### API Call Verification
```typescript
// Standard pattern for verifying API interactions
expect(mockDIDVCClient.call).toHaveBeenCalledWith(
  expect.stringMatching(/test-phone-uid-/),
  "test-phone-auth-token",
  "/did/jobs/connectionless/create",
  "POST",
  expect.objectContaining({
    // Expected request payload structure
  })
);
```

### Non-blocking Behavior Verification
```typescript
// Verify main flow completes despite external failures
const result = await useCase.userCreateAccount(ctx, input);
expect(result.user).toBeDefined();
expect(result.membership?.status).toBe(MembershipStatus.ACTIVE);

// Separately verify external API failure handling
const didRequest = await TestDataSourceHelper.findDIDIssuanceRequest(result.user!.id);
expect(didRequest?.status).toBe("PENDING");
```

## Coverage Assessment

### ✅ Well Covered Scenarios
- **Basic failure patterns**: Comprehensive coverage of null returns and timeouts
- **Database state management**: Consistent patterns across all failure types
- **Non-blocking behavior**: Thorough validation of main flow protection
- **Error message standardization**: Uniform error handling across services
- **Retry count management**: Proper increment patterns for failed requests

### ⚠️ Coverage Gaps
- **Complex retry scenarios**: Limited testing of retry count progression (1, 2, 3, etc.)
- **Cascading failure handling**: Minimal testing of failure propagation between services
- **Performance under sustained failures**: No load testing for extended outage scenarios
- **Circuit breaker patterns**: No testing of automatic failure detection and recovery
- **Monitoring and alerting**: Limited validation of error logging and notification systems

## Recommendations for Enhanced Coverage

### High Priority Enhancements
1. **Extended Retry Scenario Tests**
   - Test retry count progression through multiple failures
   - Validate eventual success after multiple retries
   - Test maximum retry limit enforcement

2. **Sustained Failure Testing**
   - Test system behavior during extended external service outages
   - Validate resource usage and performance under sustained failures
   - Test recovery behavior when external services return to normal

### Medium Priority Enhancements
3. **Complex Integration Tests**
   - Test failure combinations across multiple external services
   - Validate error correlation and debugging capabilities
   - Test manual intervention and recovery procedures

4. **Monitoring and Observability Tests**
   - Validate error logging completeness and accuracy
   - Test alerting thresholds and notification systems
   - Verify metrics collection for external API failures

This comprehensive external API failure handling strategy ensures robust system operation even when external dependencies experience various types of failures, while maintaining clear patterns for testing and validation.
