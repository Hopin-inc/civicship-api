import { postExecRule, preExecRule } from "@graphql-authz/core";
import { AuthenticationError, AuthorizationError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import { GqlRole as Role } from "@/types/graphql";
import { GqlUser } from "@/types/graphql";

// 🔐 ログイン済みか
const IsUser = preExecRule({
  error: new AuthenticationError("User must be logged in"),
})((context: IContext) => {
  return !!context.currentUser;
});

// 🔐 システム管理者か
const IsAdmin = preExecRule({
  error: new AuthorizationError("User must be admin"),
})((context: IContext) => {
  const user = context.currentUser;
  return !!user && user.sysRole === "SYS_ADMIN";
});

// 🔐 自分自身の操作か
const IsSelf = preExecRule({
  error: new AuthorizationError("User is not self"),
})((context: IContext, args: any) => {
  const user = context.currentUser;
  const permission = args.permission;
  return !!user && user.id === permission?.userId;
});

// 🔐 コミュニティのオーナーか
const IsCommunityOwner = preExecRule({
  error: new AuthorizationError("User must be community owner"),
})((context: IContext, args: any) => {
  const user = context.currentUser;
  const permission = args.permission;

  if (!user) return false;
  if (!permission?.communityId) return false;

  const membership = context.hasPermissions?.memberships?.find(
    (m) => m.communityId === permission.communityId,
  );

  return membership?.role === Role.Owner;
});

// 🔐 コミュニティマネージャー（OWNER または MANAGER）
const IsCommunityManager = preExecRule({
  error: new AuthorizationError("User must be community manager or owner."),
})((context: IContext, args: any) => {
  const user = context.currentUser;
  const permission = args.permission;

  if (!user || !permission?.communityId) return false;

  const membership = context.hasPermissions?.memberships?.find(
    (m) => m.communityId === permission.communityId,
  );
  return membership?.role === Role.Owner || membership?.role === Role.Manager;
});

// 🔐 コミュニティメンバー（OWNER / MANAGER / MEMBER）
const IsCommunityMember = preExecRule({
  error: new AuthorizationError("User must be a community member"),
})((context: IContext, args: any) => {
  const user = context.currentUser;
  const permission = args.permission;

  if (!user || !permission?.communityId) return false;

  const membership = context.hasPermissions?.memberships?.find(
    (m) => m.communityId === permission.communityId,
  );
  return [Role.Owner, Role.Manager, Role.Member].includes(membership?.role as Role);
});

// 🔐 Opportunity 作成者
const IsOpportunityOwner = preExecRule({
  error: new AuthorizationError("User must be opportunity owner"),
})((context: IContext, args: any) => {
  const user = context.currentUser;
  const opportunityId = args?.permission?.opportunityId;

  if (!user || !opportunityId) return false;

  return (
    context.hasPermissions?.opportunitiesCreatedByMe?.some((op) => op.id === opportunityId) ?? false
  );
});

const CanReadPhoneNumber = postExecRule({
  error: new AuthorizationError("Not authorized to read phone number"),
})((context: IContext, _args: any, result: GqlUser) => {
  const viewer = context.currentUser;
  if (!viewer) return false;

  const isSelf = viewer.id === result.id;
  const isAdmin = viewer.sysRole === "SYS_ADMIN";

  const targetCommunityIds =
    result.memberships?.flatMap((m) => (m?.community?.id ? [m.community.id] : [])) ?? [];

  const isCommunityManager = targetCommunityIds.some((cid) =>
    context.hasPermissions?.memberships?.some(
      (m) => m.communityId === cid && (m.role === Role.Owner || m.role === Role.Manager),
    ),
  );

  return isSelf || isAdmin || isCommunityManager;
});

export const rules = {
  IsUser,
  IsAdmin,
  IsSelf,
  IsCommunityOwner,
  IsCommunityManager,
  IsCommunityMember,
  IsOpportunityOwner,
  CanReadPhoneNumber,
} as const;
