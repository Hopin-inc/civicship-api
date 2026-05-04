import { preExecRule } from "@graphql-authz/core";
import { AuthenticationError, AuthorizationError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import {
  canManageOpportunity as canManageOpportunityHelper,
  isCommunityManager,
  isCommunityMember,
  isCommunityOwner,
} from "@/presentation/graphql/rules/helpers";

// 🔐 ログイン済みか
const IsUser = preExecRule({
  error: new AuthenticationError("User must be logged in"),
})((context: IContext) => {
  if (context.isAdmin) return true;

  const isAuthenticated = !!context.currentUser;

  if (!isAuthenticated) {
    logger.warn("IsUser authorization FAILED", {
      rule: "IsUser",
      hasContextUser: false,
      communityId: context.communityId ?? null,
      reason: "no_authenticated_user",
    });
  }

  return isAuthenticated;
});

// 🔐 システム管理者か
const IsAdmin = preExecRule({
  error: new AuthorizationError("User must be admin"),
})((context: IContext) => {
  if (context.isAdmin) return true;

  const user = context.currentUser;
  const isAdmin = !!user && user.sysRole === "SYS_ADMIN";

  if (!isAdmin) {
    logger.warn("IsAdmin authorization FAILED", {
      rule: "IsAdmin",
      hasContextUser: !!user,
      contextUserId: user?.id ?? null,
      userSysRole: user?.sysRole ?? null,
      communityId: context.communityId ?? null,
      reason: !user ? "no_authenticated_user" : "not_sys_admin",
    });
  }

  return isAdmin;
});

// 🔐 自分自身の操作か
const IsSelf = preExecRule({
  error: new AuthorizationError("User is not self"),
})((context: IContext, args: { permission?: { userId?: string } }) => {
  const user = context.currentUser;
  const permission = args.permission;
  const isMatch = !!user && user.id === permission?.userId;

  if (!isMatch) {
    logger.warn("IsSelf authorization FAILED", {
      rule: "IsSelf",
      hasContextUser: !!user,
      contextUserId: user?.id ?? null,
      permissionUserId: permission?.userId ?? null,
      communityId: context.communityId ?? null,
      reason: !user ? "no_authenticated_user" : "user_id_mismatch",
      authMeta: context.authMeta ?? null,
    });
  }

  return isMatch;
});

// 🔐 コミュニティのオーナーか
const IsCommunityOwner = preExecRule({
  error: new AuthorizationError("User must be community owner"),
})((
  context: IContext,
  args: { permission?: { communityId?: string }; communityPermission?: { communityId?: string } },
) => {
  if (context.isAdmin) return true;

  const communityId =
    args.permission?.communityId ?? args.communityPermission?.communityId ?? context.communityId;
  if (!communityId) {
    logger.warn("IsCommunityOwner authorization FAILED", {
      rule: "IsCommunityOwner",
      reason: "no_community_id_resolvable",
    });
    return false;
  }

  const allowed = isCommunityOwner(context, communityId);

  if (!allowed) {
    logger.warn("IsCommunityOwner authorization FAILED", {
      rule: "IsCommunityOwner",
      userId: context.currentUser?.id ?? null,
      communityId,
      reason: "not_owner",
    });
  }

  return allowed;
});

// 🔐 コミュニティマネージャー（OWNER または MANAGER）
const IsCommunityManager = preExecRule({
  error: new AuthorizationError("User must be community manager or owner"),
})((context: IContext, args: { permission?: { communityId?: string } }) => {
  if (context.isAdmin) return true;

  const communityId = args.permission?.communityId ?? context.communityId;
  if (!communityId) {
    logger.warn("IsCommunityManager authorization FAILED", {
      rule: "IsCommunityManager",
      reason: "no_community_id_resolvable",
    });
    return false;
  }

  const allowed = isCommunityManager(context, communityId);

  if (!allowed) {
    logger.warn("IsCommunityManager authorization FAILED", {
      rule: "IsCommunityManager",
      userId: context.currentUser?.id ?? null,
      communityId,
      reason: "not_manager_or_owner",
    });
  }

  return allowed;
});

// 🔐 コミュニティメンバー（OWNER / MANAGER / MEMBER）
const IsCommunityMember = preExecRule({
  error: new AuthorizationError("User must be a community member"),
})((context: IContext, args: { permission?: { communityId?: string } }) => {
  if (context.isAdmin) return true;

  const communityId = args.permission?.communityId ?? context.communityId;
  if (!communityId) {
    logger.warn("IsCommunityMember authorization FAILED", {
      rule: "IsCommunityMember",
      reason: "no_community_id_resolvable",
    });
    return false;
  }

  const allowed = isCommunityMember(context, communityId);

  if (!allowed) {
    logger.warn("IsCommunityMember authorization FAILED", {
      rule: "IsCommunityMember",
      userId: context.currentUser?.id ?? null,
      communityId,
      reason: "not_member",
    });
  }

  return allowed;
});

// 🔐 Opportunity 管理権限（owner OR community manager）
const CanManageOpportunity = preExecRule({
  error: new AuthorizationError("User cannot manage opportunity"),
})(async (context: IContext, args: { permission?: { opportunityId?: string } }) => {
  if (context.isAdmin) return true;

  const opportunityId = args.permission?.opportunityId;
  if (!opportunityId) {
    logger.warn("CanManageOpportunity authorization FAILED", {
      rule: "CanManageOpportunity",
      reason: "no_opportunity_id_in_permission",
    });
    return false;
  }

  const result = await canManageOpportunityHelper(context, opportunityId);

  if (!result.allowed) {
    logger.warn("CanManageOpportunity authorization FAILED", {
      rule: "CanManageOpportunity",
      userId: context.currentUser?.id ?? null,
      opportunityId,
      communityId: result.communityId,
      membershipRole: result.membershipRole,
      isOpportunityOwner: result.isOpportunityOwner,
      reason: "not_manager_nor_owner",
    });
    return false;
  }

  return true;
});

export const rules = {
  IsUser,
  IsAdmin,
  IsSelf,
  IsCommunityOwner,
  IsCommunityManager,
  IsCommunityMember,
  CanManageOpportunity,
} as const;
