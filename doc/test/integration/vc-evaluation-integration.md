# VC評価統合テスト

## 概要
評価プロセス中のVC発行テストで、外部API障害がポイント転送と評価完了をブロックしないことを確認します。

**テストファイル**: `src/__tests__/integration/pointTransfer/evaluatePassParticipation.test.ts`  
**総テストケース数**: 7

## テストセットアップ要件

### 重要な前提条件
- **電話アイデンティティを持つ参加ユーザー**: VC発行トリガーのために`IdentityPlatform.PHONE`アイデンティティが必要
- **完了したDID発行リクエスト**: `status="COMPLETED"`と有効なDID値で事前作成
- **適切なウォレットとコミュニティセットアップ**: ポイント転送検証に必要
- **評価インフラストラクチャ**: 機会、参加、予約のセットアップ

### テストデータセットアップパターン
```typescript
// 電話アイデンティティ作成（VC発行に重要）
await TestDataSourceHelper.createIdentity({
  uid: `test-phone-uid-${uniqueId}`,
  platform: IdentityPlatform.PHONE,
  authToken: "test-phone-auth-token",
  refreshToken: "test-phone-refresh-token",
  tokenExpiresAt: new Date(Date.now() + 3600000),
  user: { connect: { id: participationUserId } },
});

// 事前作成されたDIDリクエスト（VC発行に必要）
await TestDataSourceHelper.createDIDIssuanceRequest({
  user: { connect: { id: participationUserId } },
  status: "COMPLETED",
  didValue: `did:prism:test-did-${uniqueId}`,
  jobId: `test-did-job-${uniqueId}`,
  processedAt: new Date(),
  retryCount: 0,
});
```

## テストケース

### 1. ポイント報酬トランザクション作成
**テスト名**: `"creates POINT_REWARD transaction on bulk evaluation"`

- **目的**: 評価プロセス中にPOINT_REWARDトランザクションが作成されることを検証
- **モック設定**: `mockDIDVCClient.call.mockResolvedValue({ jobId: "test-job-id" })`
- **テストフロー**:
  1. PASSEDステータスでバルク評価を実行
  2. POINT_REWARDトランザクションをデータベースでクエリ
  3. トランザクション作成を検証
- **期待される動作**: 
  - POINT_REWARDトランザクションが正常に作成される
  - トランザクションが評価プロセスに適切にリンクされる
- **検証**: `expect(transaction).toBeDefined()`

### 2. ポイント転送検証
**テスト名**: `"transfers points from opportunityOwner to participation wallet on bulk evaluation"`

- **目的**: ポイントが機会オーナーから参加者に正しく移動することを確認
- **モック設定**: `mockDIDVCClient.call.mockResolvedValue({ jobId: "test-job-id" })`
- **テストフロー**:
  1. PASSEDステータスでバルク評価を実行
  2. POINT_REWARDトランザクションを検索
  3. ポイント転送詳細を検証
- **期待される動作**: 
  - ポイントが機会オーナーウォレットから参加ウォレットに転送される
  - 転送金額が期待値と一致する
- **データベース検証**:
  - `tx.from`: opportunityOwnerWalletId
  - `tx.to`: participationWalletId
  - `tx.fromPointChange`: testSetup.pointsToEarn
  - `tx.toPointChange`: testSetup.pointsToEarn

### 3. ポイントビュー更新
**テスト名**: `"updates currentPointView after bulk evaluation"`

- **目的**: 評価後にマテリアライズドビューが新しい残高を反映することを確認
- **モック設定**: `mockDIDVCClient.call.mockResolvedValue({ jobId: "test-job-id" })`
- **テストフロー**:
  1. バルク評価を実行
  2. マテリアライズドビューを更新
  3. 更新されたポイント残高を検証
- **期待される動作**: 
  - 参加ユーザーがポイントを獲得
  - 機会オーナーがポイントを失う
  - コミュニティウォレット残高が正しく更新される
- **残高検証**:
  - 参加ポイント: `BigInt(testSetup.pointsToEarn)`
  - オーナーポイント: `BigInt(testSetup.communityInitialPoint - testSetup.pointsToEarn)`
  - コミュニティポイント: `BigInt(0)`

### 4. VC外部API失敗（ノンブロッキング）
**テスト名**: `"should complete evaluation successfully even when VC external API fails"`

- **目的**: VC APIが完全に失敗しても評価が完了することを確認
- **モック設定**: `mockDIDVCClient.call.mockResolvedValue(null)`
- **テストフロー**:
  1. VC外部API失敗（null返却）をシミュレーション
  2. バルク評価を実行
  3. 評価とポイント転送が完了することを検証
  4. VCリクエストがエラー状態でマークされることを確認
- **期待される動作**: 
  - VC API失敗にもかかわらずポイント転送が成功
  - 評価が正常に完了
  - VCリクエストが失敗としてマークされるが、メインフローをブロックしない
- **データベース状態検証**:
  - `vcRequest.status`: "PENDING"
  - `vcRequest.errorMessage`: "External API call failed"
  - `vcRequest.retryCount`: 1
  - `vcRequest.jobId`: null
- **API呼び出し検証**:
  ```typescript
  expect(mockDIDVCClient.call).toHaveBeenCalledWith(
    expect.stringMatching(/test-phone-uid-/),
    "test-phone-auth-token",
    "/vc/jobs/connectionless/issue-to-holder",
    "POST",
    expect.objectContaining({
      claims: expect.any(Object),
      credentialFormat: expect.any(String),
      schemaId: undefined,
    })
  );
  ```

### 5. VC外部APIタイムアウトハンドリング
**テスト名**: `"should handle VC external API timeout gracefully"`

- **目的**: VC発行中の適切なタイムアウトハンドリングをテスト
- **モック設定**: 
  ```typescript
  mockDIDVCClient.call.mockImplementation(() => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(null), 100);
    });
  });
  ```
- **テストフロー**:
  1. 100ms遅延でAPIタイムアウトをシミュレーション
  2. 評価プロセスを実行
  3. 非同期VC処理を待機（1200ms）
  4. タイムアウトが適切に処理されることを検証
- **期待される動作**: 
  - APIタイムアウトにもかかわらず評価が完了
  - ポイント転送が正常に進行
  - VCリクエストがタイムアウトで非同期に処理される
- **データベース状態**: API失敗と同じ（PENDINGステータスとエラーメッセージ）

### 6. 成功したVC発行
**テスト名**: `"should handle successful VC issuance when external API succeeds"`

- **目的**: 外部APIが成功した場合の通常のVC発行フローを検証
- **モック設定**: `mockDIDVCClient.call.mockResolvedValue({ jobId: "test-vc-job-id" })`
- **テストフロー**:
  1. 成功したAPIレスポンスを設定
  2. バルク評価を実行
  3. 成功したVC処理を検証
- **期待される動作**: 
  - 評価とポイント転送が正常に完了
  - VCリクエストがジョブIDで処理中としてマークされる
- **データベース状態検証**:
  - `vcRequest.status`: "PROCESSING"
  - `vcRequest.jobId`: "test-vc-job-id"
  - `vcRequest.errorMessage`: null
  - `vcRequest.retryCount`: 0

### 7. 複数の外部API失敗
**テスト名**: `"should handle multiple external API failures simultaneously"`

- **目的**: 複数のサービス失敗下でのシステム回復力をテスト
- **モック設定**: `mockDIDVCClient.call.mockResolvedValue(null)`
- **テストフロー**:
  1. すべての外部APIが失敗することをシミュレーション
  2. バルク評価を実行
  3. コア機能が影響を受けないことを検証
- **期待される動作**: 
  - コア評価とポイント転送が完全に影響を受けない
  - 複数の失敗状態が適切に記録される
  - システムがカスケード失敗に対する回復力を実証
- **検証**:
  - ポイント転送成功: `expect(transaction?.from).toEqual(opportunityOwnerWalletId)`
  - VC失敗記録: `expect(vcRequest?.status).toBe("PENDING")`
  - 単一API呼び出し: `expect(mockDIDVCClient.call).toHaveBeenCalledTimes(1)`

## VC発行トリガー条件

### VC発行に必要な条件
1. **評価ステータス**: `PASSED`である必要
2. **ユーザーアイデンティティ**: `IdentityPlatform.PHONE`アイデンティティが必要
3. **DID完了**: ユーザーが完了したDID発行リクエストを持つ必要
4. **認証**: 有効な電話認証トークンが必要

### VCリクエスト作成プロセス
1. PASSEDとしてマークされた評価がVC発行をトリガー
2. システムが必要な電話アイデンティティとDIDをチェック
3. 評価関連付けでVCリクエストが作成される
4. 外部APIが非同期で呼び出される
5. APIレスポンスに基づいてリクエストステータスが更新される

## 非同期処理パターン

### テストタイミング考慮事項
- **非同期待機**: テストは1000-1200ms遅延で`setTimeout`を使用
- **データベースポーリング**: 非同期処理完了後にVCリクエストをチェック
- **ノンブロッキング検証**: メイン評価フローは即座に検証、VC処理は別途チェック

### エラーハンドリング検証
```typescript
await new Promise(resolve => setTimeout(resolve, 1000));
const vcRequest = await TestDataSourceHelper.findVCIssuanceRequest(evaluationId);
expect(vcRequest?.status).toBe("PENDING");
expect(vcRequest?.errorMessage).toBe("External API call failed");
```

## カバレッジ評価

### ✅ 十分にカバーされている領域
- **評価フロー保護**: 外部失敗にもかかわらずメインプロセスが継続
- **ポイント転送検証**: ポイント移動の包括的検証
- **VC失敗ハンドリング**: 複数の失敗シナリオが徹底的にテストされている
- **データベース状態管理**: リクエストステータス追跡の一貫したパターン
- **非同期処理**: ノンブロッキングVC発行の適切な処理

### ⚠️ 特定されたギャップ
- **バルク評価シナリオ**: 複数の評価を同時に行う限定的テスト
- **同時評価**: 同時評価処理のテストが不足
- **VCリトライメカニズム**: テストは初期失敗のみをカバー、リトライ処理なし
- **複雑な評価状態**: 評価ステータス遷移の限定的テスト
- **負荷下でのパフォーマンス**: 大量評価シナリオのテストなし

## 実装ノート

### ノンブロッキングアーキテクチャ
- VC発行は評価完了後に非同期で処理される
- 外部API失敗はポイント転送や評価プロセスを中断しない
- データベースがVCリクエストの個別状態追跡を維持

### テストインフラストラクチャ強化
- `TestDataSourceHelper`がVC固有メソッドで拡張
- VCトリガー条件のための適切な電話アイデンティティセットアップ
- 包括的な非同期処理検証
- ターゲット化された外部APIモッキングでの実サービス統合

このテストスイートは、外部VCサービスが失敗を経験しても評価とポイント転送プロセスが堅牢で信頼性を保ち、VC統合機能の包括的検証を維持することを確保します。
