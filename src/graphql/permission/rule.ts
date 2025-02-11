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

// TODO: 基本的なユースケースは自分のデータを更新できる・Adminは別途必要なら作成する・inputにIDを指定しない更新する（User自身にまつわるデータが対象）
export const isSelf = rule({ cache: "contextual" })((parent, args, ctx: IContext) => {
  if (!ctx.currentUser) return false;
  return ctx.currentUser.id === args.id;
});

// TODO: inputにcommunityIdを必須で追加する(Serviceは更新しなくておk）
export const isCommunityOwner = rule({ cache: "contextual" })(async (
  parent,
  args,
  ctx: IContext,
) => {
  if (!ctx.currentUser || !args.communityId) return false;
  const communityId = args.communityId;

  const membership = ctx.currentUser.memberships?.find((m) => m.communityId === communityId);
  if (!membership) return false;

  return membership.role === Role.OWNER;
});

export const isCommunityManager = rule({ cache: "contextual" })(async (
  parent,
  args,
  ctx: IContext,
) => {
  if (!ctx.currentUser || !args.communityId) return false;
  const communityId = args.communityId;

  const membership = ctx.currentUser.memberships?.find((m) => m.communityId === communityId);
  if (!membership) return false;

  return membership.role === Role.MANAGER;
});
