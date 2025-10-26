import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { PrismaAuthUser } from "@/application/domain/account/user/data/type";
import { GqlIdentityPlatform as IdentityPlatform } from "@/types/graphql";
import { Loaders } from "@/presentation/graphql/dataloader";

/**
 * クライアントから送られてくる認証関連ヘッダ
 */
export interface AuthHeaders {
  authMode: "id_token" | "session";
  idToken?: string;
  adminApiKey?: string;
  communityId?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  phoneAuthToken?: string;
  phoneRefreshToken?: string;
  phoneTokenExpiresAt?: string;
  phoneUid?: string;
}

/**
 * 共通構造
 */
export interface AuthResultBase {
  issuer: PrismaClientIssuer;
  loaders: Loaders;

  communityId: string;
  tenantId?: string;
  platform?: IdentityPlatform;
  uid?: string;
  phoneUid?: string;
  currentUser?: PrismaAuthUser | null;
  isAdmin?: boolean;

  phoneAuthToken?: string;
  phoneRefreshToken?: string;
  phoneTokenExpiresAt?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  idToken?: string;
}

/**
 * 管理者認証成功時
 */
export interface AdminAuthResult extends AuthResultBase {
  isAdmin: true;
}

/**
 * Firebase認証成功時
 */
export interface FirebaseAuthResult extends AuthResultBase {
  isAdmin?: false;
}

/**
 * 未認証リクエスト
 */
export interface AnonymousAuthResult extends AuthResultBase {
  isAdmin?: false;
}

/**
 * 統一戻り型
 */
export type AuthResult = AdminAuthResult | FirebaseAuthResult | AnonymousAuthResult;
