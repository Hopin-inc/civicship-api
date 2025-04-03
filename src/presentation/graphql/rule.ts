import { preExecRule } from "@graphql-authz/core";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import { Role } from "@prisma/client";
import sanitize from "sanitize-html";

// 🔐 ログイン済みか
const IsUser = preExecRule({
  error: "User must be logged in",
})((context: IContext) => {
  if (!context.currentUser) {
    throw new AuthenticationError("User must be logged in");
  }
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
});

// 🔐 入力サニタイズ検証
const VerifySanitizeInput = preExecRule({
  error: "Invalid input: disallowed HTML tags detected",
})((_context: IContext, args: any) => {
  recursiveSanitize(args.input);
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

export const rules = {
  IsUser,
  IsAdmin,
  IsSelf,
  IsCommunityOwner,
  IsCommunityManager,
  IsCommunityMember,
  IsOpportunityOwner,
  VerifySanitizeInput,
} as const;
