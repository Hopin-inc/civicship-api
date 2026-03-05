# Firebase テナントID廃止 実装計画

## 概要

各コミュニティごとに Firebase Multi-tenancy を使っていた設計をやめ、グローバル Firebase Auth に統一する。

## 変更ファイル一覧

### 1. 認証ミドルウェア

#### `src/presentation/middleware/auth/firebase-auth.ts`
- `CommunityConfigService` のインポートと `getFirebaseTenantId` の呼び出しを削除
- `auth.tenantManager().authForTenant(tenantId)` → グローバル `auth` に変更
- テナントミスマッチチェック（`decodedTenant !== tenantId`）を削除
- `tenantId` を戻り値から削除

#### `src/presentation/middleware/session.ts`
- `CommunityConfigService` のインポートと `getFirebaseTenantId` の呼び出しを削除
- `auth.tenantManager().authForTenant(tenantId)` → グローバル `auth` に変更
- テナント関連のデバッグログを整理（`tenantId` 参照箇所を削除）

### 2. LIFF 認証

#### `src/application/domain/account/auth/liff/usercase.ts`
- `getFirebaseTenantId` の呼び出しを削除
- `LIFFService.createFirebaseCustomToken(profile, tenantId)` → `LIFFService.createFirebaseCustomToken(profile)` に変更（第2引数削除）

#### `src/application/domain/account/auth/liff/service.ts`
- `createFirebaseCustomToken(profile: LINEProfile, tenantId?: string)` の `tenantId` 引数を削除
- `tenantId ? auth.tenantManager().authForTenant(tenantId) : auth` → グローバル `auth` に固定

### 3. Identity サービス

#### `src/application/domain/account/identity/service.ts`
- `deleteFirebaseAuthUser(uid: string, tenantId: string)` のシグネチャから `tenantId` を削除
- `auth.tenantManager().authForTenant(tenantId).deleteUser(uid)` → `auth.deleteUser(uid)` に変更

#### `src/application/domain/account/identity/usecase.ts`
- `deleteFirebaseAuthUser(uid, context.tenantId)` → `deleteFirebaseAuthUser(uid)` に変更
- `userDeleteAccount` の `!context.tenantId` チェックを削除（`uid`/`platform` のチェックのみ残す）

### 4. コミュニティ設定サービス

#### `src/application/domain/account/community/config/service.ts`
- `getFirebaseTenantId` メソッドを削除

### 5. 型定義

#### `src/presentation/middleware/auth/types.ts`
- `AuthResultBase.tenantId?: string` を削除

### 6. Prisma スキーマ & マイグレーション

#### `src/infrastructure/prisma/schema.prisma`
- `CommunityFirebaseConfig` モデルを削除（`tenantId` しか実データがないため不要になる）
- `CommunityConfig` の `firebaseConfig` リレーションを削除

**マイグレーション手順:**
```bash
pnpm db:migrate  # "remove_firebase_tenant_id" という名前で
pnpm db:generate
```

### 7. テストの修正

#### `src/__tests__/unit/account/identity.service.test.ts`
- `deleteFirebaseAuthUser` のテストから `tenantId` 引数を削除

#### `src/__tests__/unit/account/identity.usecase.test.ts`
- `deleteFirebaseAuthUser` のモックシグネチャを更新

## 注意事項

- Firebase Console 側でテナントからルートプロジェクトへのユーザー移行は**フロントエンドチームと協議が必要**（このバックエンド変更だけでは完結しない）
- 電話番号認証（`firebase-phone-auth.ts`）はもともとグローバル Auth を使っているため変更不要
- Admin 認証（`admin-access.ts`）もテナント不使用のため変更不要

## 変更の影響範囲

変更が必要なファイル数: **9ファイル + DBマイグレーション1件**
