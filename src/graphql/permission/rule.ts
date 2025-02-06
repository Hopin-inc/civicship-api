import { IContext } from "@/types/server";
import { or, rule } from "graphql-shield";
import { Role } from "@prisma/client";

export const isAdmin = rule({ cache: "contextual" })(async (_parent, _args, ctx: IContext) => {
  return ctx.currentUser?.sysRole === "SYS_ADMIN";
});

export const isUser = rule({ cache: "contextual" })(async (_parent, _args, ctx: IContext) => {
  return !!ctx.currentUser;
});

export const isAuthenticated = or(isUser, isAdmin);

export const isNotAuthenticated = rule({ cache: "contextual" })(async (
  _parent,
  _args,
  ctx: IContext,
) => {
  return ctx.currentUser === null;
});

export const isSelf = rule({ cache: "contextual" })((parent, args, ctx: IContext) => {
  if (!ctx.currentUser) return false;
  return ctx.currentUser.id === args.id;
});

export const isCommunityOwnerOrManager = rule({ cache: "contextual" })(async (
  parent,
  args,
  ctx: IContext,
) => {
  if (!ctx.currentUser) return false;
  const communityId = args.input?.communityId || args.communityId || args.id;
  if (!communityId) return false;
  const membership = ctx.currentUser.memberships?.find((m) => m.communityId === communityId);
  if (!membership) return false;

  const validRoles: Role[] = [Role.OWNER, Role.MANAGER];
  return validRoles.includes(membership.role);
});
