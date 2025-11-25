import { postExecRule, preExecRule } from "@graphql-authz/core";
import { AuthenticationError, AuthorizationError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import { GqlUser } from "@/types/graphql";
import logger from "@/infrastructure/logging";
import { container } from "tsyringe";
import OpportunityService from "@/application/domain/experience/opportunity/service";

enum Role {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  MEMBER = "MEMBER",
}

// 🔐 ログイン済みか
const IsUser = preExecRule({
  error: new AuthenticationError("User must be logged in"),
})((context: IContext) => {
  if (context.isAdmin) return true;

  const isAuthenticated = !!context.currentUser;

  if (!isAuthenticated) {
    logger.error("IsUser authorization FAILED", {
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
    logger.error("IsAdmin authorization FAILED", {
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
    logger.error("IsSelf authorization FAILED", {
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
})((context: IContext, args: { permission?: { communityId?: string } }) => {
  if (context.isAdmin) return true;

  const user = context.currentUser;
  const permission = args.permission;

  if (!user) {
    logger.error("IsCommunityOwner authorization FAILED", {
      rule: "IsCommunityOwner",
      hasContextUser: false,
      permissionCommunityId: permission?.communityId ?? null,
      communityId: context.communityId ?? null,
      reason: "no_authenticated_user",
      authMeta: context.authMeta ?? null,
    });
    return false;
  }

  if (!permission?.communityId) {
    logger.error("IsCommunityOwner authorization FAILED", {
      rule: "IsCommunityOwner",
      hasContextUser: true,
      contextUserId: user.id,
      permissionCommunityId: null,
      communityId: context.communityId ?? null,
      reason: "no_community_id_in_permission",
    });
    return false;
  }

  const membership = context.currentUser?.memberships?.find(
    (m) => m.communityId === permission.communityId,
  );

  const isOwner = membership?.role === Role.OWNER;

  if (!isOwner) {
    logger.error("IsCommunityOwner authorization FAILED", {
      rule: "IsCommunityOwner",
      hasContextUser: true,
      contextUserId: user.id,
      permissionCommunityId: permission.communityId,
      communityId: context.communityId ?? null,
      membershipRole: membership?.role ?? null,
      reason: !membership ? "no_membership" : "not_owner",
    });
  }

  return isOwner;
});

// 🔐 コミュニティマネージャー（OWNER または MANAGER）
const IsCommunityManager = preExecRule({
  error: new AuthorizationError("User must be community manager or owner."),
})((context: IContext, args: { permission?: { communityId?: string } }) => {
  if (context.isAdmin) return true;

  const user = context.currentUser;
  const permission = args.permission;

  if (!user) {
    logger.error("IsCommunityManager authorization FAILED", {
      rule: "IsCommunityManager",
      hasContextUser: false,
      permissionCommunityId: permission?.communityId ?? null,
      communityId: context.communityId ?? null,
      reason: "no_authenticated_user",
    });
    return false;
  }

  if (!permission?.communityId) {
    logger.error("IsCommunityManager authorization FAILED", {
      rule: "IsCommunityManager",
      hasContextUser: true,
      contextUserId: user.id,
      permissionCommunityId: null,
      communityId: context.communityId ?? null,
      reason: "no_community_id_in_permission",
    });
    return false;
  }

  const membership = context.currentUser?.memberships?.find(
    (m) => m.communityId === permission.communityId,
  );

  const isManager = membership?.role === Role.OWNER || membership?.role === Role.MANAGER;

  if (!isManager) {
    logger.error("IsCommunityManager authorization FAILED", {
      rule: "IsCommunityManager",
      hasContextUser: true,
      contextUserId: user.id,
      permissionCommunityId: permission.communityId,
      communityId: context.communityId ?? null,
      membershipRole: membership?.role ?? null,
      reason: !membership ? "no_membership" : "not_manager_or_owner",
    });
  }

  return isManager;
});

// 🔐 コミュニティメンバー（OWNER / MANAGER / MEMBER）
const IsCommunityMember = preExecRule({
  error: new AuthorizationError("User must be a community member"),
})((context: IContext, args: { permission?: { communityId?: string } }) => {
  if (context.isAdmin) return true;

  const user = context.currentUser;
  const permission = args.permission;

  if (!user) {
    logger.error("IsCommunityMember authorization FAILED", {
      rule: "IsCommunityMember",
      hasContextUser: false,
      permissionCommunityId: permission?.communityId ?? null,
      communityId: context.communityId ?? null,
      reason: "no_authenticated_user",
    });
    return false;
  }

  if (!permission?.communityId) {
    logger.error("IsCommunityMember authorization FAILED", {
      rule: "IsCommunityMember",
      hasContextUser: true,
      contextUserId: user.id,
      permissionCommunityId: null,
      communityId: context.communityId ?? null,
      reason: "no_community_id_in_permission",
    });
    return false;
  }

  const membership = context.currentUser?.memberships?.find(
    (m) => m.communityId === permission.communityId,
  );

  const isMember = [Role.OWNER, Role.MANAGER, Role.MEMBER].includes(membership?.role as Role);

  if (!isMember) {
    logger.error("IsCommunityMember authorization FAILED", {
      rule: "IsCommunityMember",
      hasContextUser: true,
      contextUserId: user.id,
      permissionCommunityId: permission.communityId,
      communityId: context.communityId ?? null,
      membershipRole: membership?.role ?? null,
      reason: !membership ? "no_membership" : "invalid_role",
    });
  }

  return isMember;
});

// 🔐 Opportunity 作成者
const IsOpportunityOwner = preExecRule({
  error: new AuthorizationError("User must be opportunity owner"),
})(async (context: IContext, args: { permission?: { opportunityId?: string } }) => {
  if (context.isAdmin) return true;

  const user = context.currentUser;
  const opportunityId = args?.permission?.opportunityId;

  if (!user) {
    logger.error("IsOpportunityOwner authorization FAILED", {
      rule: "IsOpportunityOwner",
      hasContextUser: false,
      permissionOpportunityId: opportunityId ?? null,
      communityId: context.communityId ?? null,
      reason: "no_authenticated_user",
    });
    return false;
  }

  if (!opportunityId) {
    logger.error("IsOpportunityOwner authorization FAILED", {
      rule: "IsOpportunityOwner",
      hasContextUser: true,
      contextUserId: user.id,
      permissionOpportunityId: null,
      communityId: context.communityId ?? null,
      reason: "no_opportunity_id_in_permission",
    });
    return false;
  }

  // Lazy check: verify ownership only when needed
  const opportunityService = container.resolve<OpportunityService>("OpportunityService");
  const isOwner = await opportunityService.isOwnedByUser(context, opportunityId, user.id);

  if (!isOwner) {
    logger.error("IsOpportunityOwner authorization FAILED", {
      rule: "IsOpportunityOwner",
      hasContextUser: true,
      contextUserId: user.id,
      permissionOpportunityId: opportunityId,
      communityId: context.communityId ?? null,
      reason: "not_opportunity_owner",
    });
  }

  return isOwner;
});

const CanReadPhoneNumber = postExecRule({
  error: new AuthorizationError("Not authorized to read phone number"),
})((
  _context: IContext,
  _args: { permission?: Record<string, unknown> },
  _phoneNumber: string | null,
  _user: GqlUser,
) => {
  return true;

  // TODO: コメントアウトしてあるTODOを解消したら、この部分全体を再度有効化
  // const viewer = context.currentUser;
  // if (!viewer) return false;
  //
  // const isSelf = viewer.id === user?.id;
  // const isAdmin = viewer.sysRole === "SYS_ADMIN";
  //
  // // TODO: userはmembershipをincludeしていない状態で渡されるので、membershipを取得する必要あり
  // const targetCommunityIds =
  //   user?.memberships?.flatMap((m) => (m?.community?.id ? [m.community.id] : [])) ?? [];
  //
  // const isCommunityManager = targetCommunityIds.some((cid) =>
  //   context.currentUser?.memberships?.some(
  //     (m) => m.communityId === cid && (m.role === Role.OWNER || m.role === Role.MANAGER),
  //   ),
  // );
  //
  // return isSelf || isAdmin || isCommunityManager;
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
