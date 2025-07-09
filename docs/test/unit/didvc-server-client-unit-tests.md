# DIDVCServerClient ユニットテスト

## 概要
DID/VC外部サーバーとの通信を担当するクライアントクラスのユニットテスト実装について、テストパターン、モック戦略、カバレッジを詳細に説明します。

**テストファイル**: `src/__tests__/unit/infrastructure/libs/didVCServerClient.test.ts`  
**総テストケース数**: 10

## テスト構造

### モック設定
```typescript
import axios from "axios";
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
```

### テストセットアップ
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  client = new DIDVCServerClient();
  process.env.API_KEY = "test-api-key";
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

## テストケース詳細

### 1. 成功シナリオ（5テストケース）

#### 1.1 GET リクエスト成功
**テスト名**: `"should make successful GET request and return data"`

- **目的**: GET リクエストの正常な実行とレスポンス処理を検証
- **モック設定**: `mockedAxios.get.mockResolvedValue({ data: { result: "success" } })`
- **検証項目**:
  - 正しいURL構築（`${IDENTUS_API_URL}${mockEndpoint}`）
  - 適切なヘッダー設定（API Key、Authorization、Content-Type）
  - デフォルトタイムアウト設定（`IDENTUS_API_TIMEOUT`）
  - レスポンスデータの正しい抽出（`{ result: "success" }`）

#### 1.2 POST リクエスト成功
**テスト名**: `"should make successful POST request with data"`

- **目的**: POST リクエストでのデータ送信とレスポンス処理を検証
- **モック設定**: `mockedAxios.post.mockResolvedValue({ data: { jobId: "test-job-id" } })`
- **検証項目**:
  - リクエストボディの正しい送信
  - POST メソッド固有のパラメータ設定
  - ジョブID形式のレスポンス処理

#### 1.3 PUT リクエスト成功
**テスト名**: `"should make successful PUT request"`

- **目的**: PUT リクエストでのデータ更新処理を検証
- **モック設定**: `mockedAxios.put.mockResolvedValue({ data: { updated: true } })`
- **検証項目**:
  - PUT メソッドでのデータ送信
  - 更新結果のレスポンス処理

#### 1.4 DELETE リクエスト成功
**テスト名**: `"should make successful DELETE request"`

- **目的**: DELETE リクエストの正常な実行を検証
- **モック設定**: `mockedAxios.delete.mockResolvedValue({ data: { deleted: true } })`
- **検証項目**:
  - DELETE メソッドの正しい実行
  - データなしでのリクエスト処理

#### 1.5 カスタムタイムアウト設定
**テスト名**: `"should use custom timeout when provided"`

- **目的**: カスタムタイムアウト値の正しい適用を検証
- **モック設定**: `customTimeout = 60000`
- **検証項目**:
  - デフォルトタイムアウトの上書き
  - カスタムタイムアウト値の正しい設定

### 2. エラーシナリオ（5テストケース）

#### 2.1 ネットワークエラー処理
**テスト名**: `"should return null and log warning on network error"`

- **目的**: ネットワーク接続エラー時の適切な処理を検証
- **モック設定**: `mockedAxios.get.mockRejectedValue(new Error("Network Error"))`
- **期待される動作**:
  - null を返す（例外を再スローしない）
  - 警告ログが出力される
  - 1回のAPI呼び出しが実行される

#### 2.2 400エラー処理
**テスト名**: `"should return null and log warning on 400 error"`

- **目的**: クライアントエラー（400番台）の適切な処理を検証
- **モック設定**: 
  ```typescript
  const badRequestError = {
    response: { status: 400, data: { error: "Bad Request" } },
    message: "Request failed with status code 400",
  };
  mockedAxios.post.mockRejectedValue(badRequestError);
  ```
- **期待される動作**:
  - null を返す
  - エラーレスポンスの詳細情報を適切に処理
  - 警告ログが出力される

#### 2.3 500エラー処理
**テスト名**: `"should return null and log warning on 500 error"`

- **目的**: サーバーエラー（500番台）の適切な処理を検証
- **モック設定**: 
  ```typescript
  const serverError = {
    response: { status: 500, data: { error: "Internal Server Error" } },
    message: "Request failed with status code 500",
  };
  mockedAxios.put.mockRejectedValue(serverError);
  ```
- **期待される動作**:
  - null を返す
  - サーバーエラーの適切な処理
  - 警告ログが出力される

#### 2.4 タイムアウトエラー処理
**テスト名**: `"should return null and log warning on timeout error"`

- **目的**: リクエストタイムアウト時の適切な処理を検証
- **モック設定**: 
  ```typescript
  const timeoutError = {
    code: "ECONNABORTED",
    message: "timeout of 30000ms exceeded",
  };
  mockedAxios.delete.mockRejectedValue(timeoutError);
  ```
- **期待される動作**:
  - null を返す
  - タイムアウト固有のエラーコード処理
  - 警告ログが出力される

#### 2.5 汎用エラー処理
**テスト名**: `"should return null for any axios error without throwing"`

- **目的**: 予期しないエラーの適切な処理を検証
- **モック設定**: `mockedAxios.get.mockRejectedValue(new Error("Something went wrong"))`
- **期待される動作**:
  - null を返す
  - 例外を再スローしない
  - あらゆるエラーを適切にキャッチ

## HTTPメソッド別検証パターン

### GET リクエスト
```typescript
expect(mockedAxios.get).toHaveBeenCalledWith(
  `${IDENTUS_API_URL}${mockEndpoint}`,
  {
    headers: {
      "x-api-key": "test-api-key",
      Authorization: `Bearer ${mockToken}`,
      "Content-Type": "application/json",
    },
    timeout: IDENTUS_API_TIMEOUT,
  }
);
```

### POST/PUT リクエスト
```typescript
expect(mockedAxios.post).toHaveBeenCalledWith(
  `${IDENTUS_API_URL}${mockEndpoint}`,
  mockData,  // リクエストボディ
  {
    headers: {
      "x-api-key": "test-api-key",
      Authorization: `Bearer ${mockToken}`,
      "Content-Type": "application/json",
    },
    timeout: IDENTUS_API_TIMEOUT,
  }
);
```

### DELETE リクエスト
```typescript
expect(mockedAxios.delete).toHaveBeenCalledWith(
  `${IDENTUS_API_URL}${mockEndpoint}`,
  {
    headers: {
      "x-api-key": "test-api-key",
      Authorization: `Bearer ${mockToken}`,
      "Content-Type": "application/json",
    },
    timeout: IDENTUS_API_TIMEOUT,
  }
);
```

## エラーハンドリングパターン

### 非ブロッキングエラー処理
- **原則**: すべてのエラーで null を返し、例外を再スローしない
- **ログ出力**: 警告レベルでエラー情報を記録
- **呼び出し元保護**: 上位層の処理を中断させない

### エラータイプ別処理
1. **ネットワークエラー**: 接続失敗、DNS解決失敗など
2. **HTTPエラー**: 400/500番台のステータスコード
3. **タイムアウトエラー**: `ECONNABORTED` コード
4. **汎用エラー**: その他の予期しないエラー

## テスト設定パターン

### 環境変数設定
```typescript
beforeEach(() => {
  process.env.API_KEY = "test-api-key";
});
```

### モッククリア
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

## カバレッジ評価

### ✅ 十分にカバーされている領域
- **全HTTPメソッド**: GET、POST、PUT、DELETE の完全カバレッジ
- **成功シナリオ**: 正常なレスポンス処理とデータ抽出
- **エラーハンドリング**: 主要なエラータイプの網羅的処理
- **設定オプション**: カスタムタイムアウトの適用
- **ヘッダー設定**: 認証、API Key、Content-Type の正しい設定
- **非ブロッキング動作**: エラー時の null 返却とログ出力

### ⚠️ 改善可能な領域
- **レスポンス形式バリエーション**: 異なるレスポンス構造のテスト
- **認証エラー**: 401/403エラーの具体的な処理テスト
- **リトライ機能**: 自動リトライ機能のテスト（実装されている場合）
- **大容量データ**: 大きなリクエスト/レスポンスの処理テスト
- **同時接続**: 複数同時リクエストの処理テスト

## インフラストラクチャ層の特徴

### 責任の分離
- **通信専用**: HTTP通信のみに特化した責任
- **エラー変換**: HTTP エラーを null 値に変換
- **設定管理**: URL、タイムアウト、認証情報の一元管理

### 上位層との連携
- **サービス層保護**: エラー時に null を返すことで上位層の処理継続を保証
- **ログ統合**: 統一されたログ形式での警告出力
- **設定外部化**: 環境変数による設定の外部化

このユニットテスト実装は、外部API通信の信頼性と堅牢性を包括的に検証しており、ネットワーク障害や外部サービス障害に対する適切な耐性を確保するための優れたテストカバレッジを提供しています。
