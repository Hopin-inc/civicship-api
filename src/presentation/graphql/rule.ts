import { postExecRule, preExecRule } from "@graphql-authz/core";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import { Role } from "@prisma/client";
import sanitize from "sanitize-html";
import { GqlUser } from "@/types/graphql";

// 🔐 ログイン済みか
const IsUser = preExecRule({
  error: "User must be logged in",
})((context: IContext) => {
  if (!context.currentUser) {
    throw new AuthenticationError("User must be logged in");
  }
  return true;
});

// 🔐 システム管理者か
const IsAdmin = preExecRule({
  error: "User is not admin",
})((context: IContext) => {
  const user = context.currentUser;
  if (!user) {
    throw new AuthenticationError("User must be logged in");
  }
  if (user.sysRole !== "SYS_ADMIN") {
    throw new AuthorizationError("User must be admin");
  }
  return true;
});

// 🔐 自分自身の操作か
const IsSelf = preExecRule({
  error: "User is not self",
})((context: IContext, args: any) => {
  const user = context.currentUser;
  const permission = args.permission;
  if (!user) {
    throw new AuthenticationError("User must be logged in");
  }
  if (user.id !== permission?.userId) {
    throw new AuthorizationError("User is not self");
  }
  return true;
});

// 🔐 コミュニティのオーナーか
const IsCommunityOwner = preExecRule({
  error: "User must be community owner",
})((context: IContext, args: any) => {
  const user = context.currentUser;
  const permission = args.permission;
  if (!user) {
    throw new AuthenticationError("User must be logged in");
  }
  if (!permission?.communityId) {
    throw new ValidationError("Community ID is required");
  }

  const membership = context.hasPermissions?.memberships?.find(
    (m) => m.communityId === permission.communityId,
  );

  if (!membership) {
    throw new AuthorizationError("User is not a member of the community");
  }

  if (membership.role !== Role.OWNER) {
    throw new AuthorizationError("User must be community owner");
  }
  return true;
});

// 🔐 コミュニティマネージャー（OWNER または MANAGER）
const IsCommunityManager = preExecRule({
  error: "User must be community manager",
})((context: IContext, args: any) => {
  const user = context.currentUser;
  const permission = args.permission;
  if (!user) {
    throw new AuthenticationError("User must be logged in");
  }
  if (!permission?.communityId) {
    throw new ValidationError("Community ID is required");
  }

  const membership = context.hasPermissions?.memberships?.find(
    (m) => m.communityId === permission.communityId,
  );
  if (!membership) {
    throw new AuthorizationError("User is not a member of the community");
  }

  if (!(membership.role === Role.OWNER || membership.role === Role.MANAGER)) {
    throw new AuthorizationError("User must be community manager");
  }
  return true;
});

// 🔐 コミュニティメンバー（OWNER / MANAGER / MEMBER）
const IsCommunityMember = preExecRule({
  error: "User must be a community member",
})((context: IContext, args: any) => {
  const user = context.currentUser;
  const permission = args.permission;
  if (!user) {
    throw new AuthenticationError("User must be logged in");
  }
  if (!permission?.communityId) {
    throw new ValidationError("Community ID is required");
  }

  const membership = context.hasPermissions?.memberships?.find(
    (m) => m.communityId === permission.communityId,
  );
  if (!membership) {
    throw new AuthorizationError("User is not a member of the community");
  }

  if (![Role.OWNER, Role.MANAGER, Role.MEMBER].includes(membership.role)) {
    throw new AuthorizationError("User must be a community member");
  }
  return true;
});

// 🔐 Opportunity 作成者
const IsOpportunityOwner = preExecRule({
  error: "User must be opportunity owner",
})((context: IContext, args: any) => {
  const user = context.currentUser;
  const opportunityId = args?.permission?.opportunityId;
  if (!user) {
    throw new AuthenticationError("User must be logged in");
  }
  if (!opportunityId) {
    throw new ValidationError("Opportunity ID is required");
  }

  const found = context.hasPermissions?.opportunitiesCreatedByMe?.some(
    (op) => op.id === opportunityId,
  );
  if (!found) {
    throw new AuthorizationError("User is not the opportunity owner");
  }
  return true;
});

// 🔐 入力サニタイズ検証
const VerifySanitizeInput = preExecRule({
  error: "Invalid input: disallowed HTML tags detected",
})((_context: IContext, args: any) => {
  recursiveSanitize(args.input);
  return true;
});

// 🔄 再帰的なサニタイズ処理
type Sanitizable =
  | string
  | number
  | boolean
  | null
  | Sanitizable[]
  | { [key: string]: Sanitizable };

function recursiveSanitize(input: Sanitizable): Sanitizable {
  if (typeof input === "string") {
    const sanitized = sanitize(input, { allowedTags: [] });
    if (input !== sanitized) {
      throw new ValidationError("Invalid input: disallowed HTML tags detected", [`${input}`]);
    }
    return sanitized;
  } else if (Array.isArray(input)) {
    return input.map(recursiveSanitize);
  } else if (input !== null && typeof input === "object") {
    const result: { [key: string]: Sanitizable } = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        result[key] = recursiveSanitize(input[key]);
      }
    }
    return result;
  }
  return input;
}

const CanReadPhoneNumber = postExecRule({
  error: "Not authorized to read phone number",
})((context: IContext, _args: any, result: GqlUser) => {
  const viewer = context.currentUser;
  if (!viewer) throw new AuthenticationError("User must be logged in");

  const isSelf = viewer.id === result.id;
  const isAdmin = viewer.sysRole === "SYS_ADMIN";

  const targetCommunityIds =
    result.memberships?.edges?.flatMap((e) =>
      e?.node?.community?.id ? [e.node.community.id] : [],
    ) ?? [];

  const isCommunityManager = targetCommunityIds.some((cid) =>
    context.hasPermissions?.memberships?.some(
      (m) => m.communityId === cid && (m.role === Role.OWNER || m.role === Role.MANAGER),
    ),
  );

  if (isSelf || isAdmin || isCommunityManager) return true;
  throw new AuthorizationError("Not authorized to read phone number");
});

export const rules = {
  IsUser,
  IsAdmin,
  IsSelf,
  IsCommunityOwner,
  IsCommunityManager,
  IsCommunityMember,
  IsOpportunityOwner,
  VerifySanitizeInput,
  CanReadPhoneNumber,
} as const;
