import { IContext } from "@/types/server";
import { or, rule } from "graphql-shield";
import { Role } from "@prisma/client";

/**
 * システム管理者（SYS_ADMIN）かどうかを判定するルール
 */
const isAdmin = rule({ cache: "contextual" })(async (_parent, _args, ctx: IContext) => {
  return ctx.currentUser?.sysRole === "SYS_ADMIN";
});

/**
 * ログイン済みかどうかを判定するルール
 */
const isUser = rule({ cache: "contextual" })(async (_parent, _args, ctx: IContext) => {
  return !!ctx.currentUser;
});

/**
 * ログイン済み または SYS_ADMIN ならOK
 */
const isAuthenticated = or(isUser, isAdmin);

/**
 * 自分自身かどうかを判定するルール
 */
const isSelf = rule({ cache: "contextual" })((_parent, _args, ctx: IContext) => {
  return !!ctx.currentUser;
});

/**
 * コミュニティのオーナー権限があるかどうかを判定するルール
 * - args.communityId が必須
 * - ctx.memberships に配列でコミュニティ・ロール情報が入っている前提
 */
const isCommunityOwner = rule({ cache: "contextual" })(async (_parent, args, ctx: IContext) => {
  if (!ctx.currentUser || !args.input.communityId) return false;
  const communityId = args.input.communityId;

  const membership = ctx.memberships?.find((m) => m.communityId === communityId);
  if (!membership) return false;

  return membership.role === Role.OWNER;
});

/**
 * コミュニティのマネージャー権限があるかどうかを判定するルール
 * - args.communityId が必須
 * - ctx.memberships に配列でコミュニティ・ロール情報が入っている前提
 */
const isCommunityManager = rule({ cache: "contextual" })(async (_parent, args, ctx: IContext) => {
  if (!ctx.currentUser || !args.input.communityId) return false;
  const communityId = args.input.communityId;

  const membership = ctx.memberships?.find((m) => m.communityId === communityId);
  if (!membership) return false;

  return membership.role === Role.MANAGER;
});

const isCommunityMember = rule({ cache: "contextual" })(async (_parent, args, ctx: IContext) => {
  if (!ctx.currentUser || !args.input.communityId) return false;
  const communityId = args.input.communityId;

  const membership = ctx.memberships?.find((m) => m.communityId === communityId);
  if (!membership) return false;

  return (
    membership.role === Role.OWNER ||
    membership.role === Role.MANAGER ||
    membership.role === Role.MEMBER
  );
});

const isCommunityOwnerOrManager = or(isCommunityOwner, isCommunityManager);

export {
  isAdmin,
  isUser,
  isAuthenticated,
  isSelf,
  isCommunityManager,
  isCommunityOwner,
  isCommunityMember,
  isCommunityOwnerOrManager,
};
