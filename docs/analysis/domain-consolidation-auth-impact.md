# 認証ドメイン統合 影響範囲分析

## 概要

本ドキュメントは、認証（Auth）関連コードのドメイン統合を行う際の影響範囲を分析したものです。

---

## 現状の認証コード分散状況

認証に関するコードは現在、以下の 5 箇所に分散しています。

### 1. `src/application/domain/account/auth/liff/`

| ファイル | 役割 |
|---|---|
| `service.ts` | LINE アクセストークン検証・プロフィール取得・Firebase カスタムトークン生成 |
| `usercase.ts` | LIFF ログインフロー（`CommunityConfigService` を直接 `container.resolve()` で取得） |

**問題点：**
- `LIFFAuthUseCase.login()` が static メソッドであり、DI 注入パターンを無視して `container.resolve()` を直接呼び出している
- UseCase が本来 DI コンテナを意識すべきでない（レイヤー違反の兆候）

---

### 2. `src/application/domain/account/identity/`

| ファイル | 役割 |
|---|---|
| `service.ts` | Firebase Auth ユーザー削除・トークンリフレッシュ・Identity の CRUD |
| `usecase.ts` | サインアップ・電話認証・アカウント削除など認証起点のユーザー初期化フロー |

**問題点：**
- `IdentityUseCase` は認証フロー（signup）とアカウント管理（delete）の両方を担っており責務が広い
- `usecase.ts` が 6 つの他ドメインサービスに依存（`MembershipService`・`WalletService`・`IncentiveGrantService`・`TransactionService`・`NotificationService`・`CommunityService`）

---

### 3. `src/presentation/middleware/auth/`

| ファイル | 役割 |
|---|---|
| `index.ts` | GraphQL コンテキスト生成エントリーポイント |
| `firebase-auth.ts` | Firebase ID トークン・セッション Cookie 検証、ユーザー照合 |
| `extract-headers.ts` | リクエストヘッダから認証情報を抽出 |
| `types.ts` | 認証結果型定義 |
| `security/index.ts` | Bot 検出・怪しいパス遮断・Admin 認証判定 |
| `security/admin-access.ts` | Admin API キー検証 |

**問題点：**
- `firebase-auth.ts` が `CommunityConfigService` を `container.resolve()` で直接呼び出している（Presentation 層がアプリケーション層の具象クラスに直接依存）
- Firebase tenant 検証ロジックが Presentation 層に埋め込まれており、テストしにくい

---

### 4. `src/presentation/middleware/session.ts`

| ファイル | 役割 |
|---|---|
| `session.ts` | POST `/sessionLogin` — Firebase セッション Cookie の発行 |

**問題点：**
- `CommunityConfigService` を `container.resolve()` で直接呼び出している（同上）
- セッション Cookie のパス（`path: "/"`)・SameSite・Secure 等の設定がここにハードコードされている

---

### 5. `src/presentation/middleware/firebase-phone-auth.ts`

| ファイル | 役割 |
|---|---|
| `firebase-phone-auth.ts` | REST API（`/wallet/nft-wallets`）向け電話認証ミドルウェア |

**問題点：**
- ユーザーが存在しない場合に Prisma を直接操作してユーザー・Identity を作成している（Service 層をバイパス）
- `tx.user.create()` で名前を `"名前未設定"`・slug を `"名前未設定"` でハードコード
- User 作成ロジックが `IdentityService`/`UserService` に存在するものと重複

---

## 依存関係グラフ（認証関連）

```
[POST /line/liff-login]
  → router/line.ts
    → LIFFAuthUseCase.login() (account/auth/liff/usercase.ts)
      → container.resolve(CommunityConfigService)   ← DI 違反
      → LIFFService.verifyAccessToken()             (外部: LINE API)
      → LIFFService.getProfile()                    (外部: LINE API)
      → CommunityConfigService.getFirebaseTenantId()
      → LIFFService.createFirebaseCustomToken()     (外部: Firebase Admin)

[POST /sessionLogin]
  → middleware/session.ts
    → container.resolve(CommunityConfigService)     ← DI 違反
    → auth.tenantManager().authForTenant().createSessionCookie()

[/graphql] (GraphQL リクエスト)
  → middleware/auth/index.ts (createContext)
    → runRequestSecurityChecks() (security/index.ts)
      → isSuspiciousPath(), isBot()
      → handleAdminAccess() (security/admin-access.ts)
        → admin API キー検証
    → handleFirebaseAuth() (firebase-auth.ts)
      → container.resolve(CommunityConfigService)   ← DI 違反
      → auth.tenantManager().authForTenant().verifySessionCookie/verifyIdToken()
      → issuer.internal() → Prisma でユーザー照合

[POST /wallet/nft-wallets]
  → router/wallet.ts
    → validateFirebasePhoneAuth() (firebase-phone-auth.ts)
      → auth.verifyIdToken()
      → issuer.internal() → Prisma でユーザー作成  ← Service 層バイパス
```

---

## 統合時の影響ファイル一覧

### 直接変更が必要なファイル

| ファイル | 変更内容 |
|---|---|
| `src/application/domain/account/auth/liff/usercase.ts` | `container.resolve()` を DI 注入に変更、または Identity ドメインへ統合 |
| `src/application/domain/account/auth/liff/service.ts` | Infrastructure 層（`libs/`）へ移動を検討 |
| `src/presentation/middleware/auth/firebase-auth.ts` | `CommunityConfigService` を DI 経由で受け取る設計に変更 |
| `src/presentation/middleware/session.ts` | 同上 |
| `src/presentation/middleware/firebase-phone-auth.ts` | User 作成ロジックを `IdentityService` または `UserService` に委譲 |
| `src/application/provider.ts` | 新しい auth ドメインの DI 登録 |

### 影響を受ける可能性があるファイル

| ファイル | 理由 |
|---|---|
| `src/presentation/router/line.ts` | `LIFFAuthUseCase` の変更に追従 |
| `src/presentation/router/wallet.ts` | `validateFirebasePhoneAuth` の変更に追従 |
| `src/index.ts` | ルーター・ミドルウェア構成変更の場合 |
| `src/application/domain/account/identity/usecase.ts` | auth 統合後の責務の再分割 |
| `src/__tests__/` 配下のテスト群 | 変更対象ファイルのテスト更新が必要 |

---

## 主要リスクと対策

### リスク 1：`container.resolve()` による密結合
- **場所：** `liff/usercase.ts`、`firebase-auth.ts`、`session.ts`
- **問題：** テストが困難、DI コンテナへの暗黙依存
- **対策：** Constructor 引数経由で `CommunityConfigService` を受け取る設計に変更

### リスク 2：Presentation 層でのユーザー作成（`firebase-phone-auth.ts`）
- **場所：** `src/presentation/middleware/firebase-phone-auth.ts`
- **問題：** バリデーション・重複チェックのバイパス、`"名前未設定"` のハードコード
- **対策：** `IdentityService.createUserAndIdentity()` または `UserService` を経由するよう変更

### リスク 3：認証 tenant ID の取得が複数箇所で重複
- **場所：** `firebase-auth.ts`・`session.ts`・`liff/usercase.ts` の 3 箇所
- **問題：** `CommunityConfigService.getFirebaseTenantId()` を 3 回独立して呼び出している
- **対策：** 認証コンテキスト生成を一元化した AuthService / AuthUseCase を新設

### リスク 4：`LIFFAuthUseCase` が static メソッドを持つ
- **場所：** `liff/usercase.ts`
- **問題：** DI コンテナに登録されておらず、テスト時のモック差し替えが不可
- **対策：** インスタンスメソッドに変換し、DI 対象にする

---

## 推奨統合方針

### 案 A：`account/auth/` ドメインを拡充する

```
account/auth/
├── liff/
│   ├── service.ts        (既存: LINE API 操作)
│   └── usecase.ts        (既存: LIFF ログイン)
├── session/
│   └── usecase.ts        (新規: セッション Cookie 発行)
├── firebase/
│   └── service.ts        (新規: Firebase 検証共通化)
└── phone/
    └── service.ts        (新規: 電話認証・ユーザー初期化)
```

- **メリット：** 認証関連コードを application 層に集約、Presentation 層の薄型化
- **デメリット：** `firebase-auth.ts`（GraphQL Context 生成）は Presentation 層に残す必要があり、完全な統合は難しい

### 案 B：Presentation 層の認証ミドルウェアを AuthService へ委譲

- `handleFirebaseAuth()` の本体ロジックを `account/auth/firebase/service.ts` へ移動
- ミドルウェアはサービスを呼び出す薄いラッパーのみ
- **メリット：** テスト容易性が向上、責務が明確
- **デメリット：** `IContext` 型定義との兼ね合いで型設計が必要

---

## テスト影響

| テストファイル | 影響 |
|---|---|
| `__tests__/unit/account/` 配下 | Identity・User サービスの変更に追従 |
| `__tests__/integration/` 配下 | サインアップ・認証フロー全体のテスト再確認 |
| 認証ミドルウェアのテスト（現在不在） | 新規テスト作成推奨 |

---

## まとめ

| 観点 | 現状 | 統合後の目標 |
|---|---|---|
| 認証コードの配置 | 5 箇所に分散 | `account/auth/` ドメインに集約 |
| DI パターン遵守 | 3 箇所で `container.resolve()` 直接呼び出し | Constructor 注入に統一 |
| Service 層バイパス | `firebase-phone-auth.ts` でユーザー作成 | `IdentityService` 経由に変更 |
| `getFirebaseTenantId()` 呼び出し | 3 箇所に重複 | 共通化・1 箇所化 |
| テスト容易性 | 低（static メソッド・直接依存） | DI 注入化で向上 |
