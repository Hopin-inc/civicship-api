import { IContext } from "@/types/server";
import { or, rule } from "graphql-shield";
import { Role } from "@prisma/client";
import sanitize from "sanitize-html";

const sanitizeInput = rule()(async (parent, { input }) => {
  const sanitizedInput = sanitize(input, { allowedTags: [] });
  return input === sanitizedInput;
});

const isAdmin = rule({ cache: "contextual" })(async (_parent, _args, ctx: IContext) => {
  return ctx.currentUser?.sysRole === "SYS_ADMIN";
});

const isUser = rule({ cache: "contextual" })(async (_parent, _args, ctx: IContext) => {
  return !!ctx.currentUser;
});

const isAuthenticated = or(isUser, isAdmin);

const isSelf = rule({ cache: "contextual" })((_parent, args, ctx: IContext) => {
  if (!ctx.currentUser) return false;
  return ctx.currentUser.id === args.input.userId;
});

const isCommunityOwner = rule({ cache: "contextual" })(async (_parent, args, ctx: IContext) => {
  if (!ctx.currentUser || !args.input.communityId) return false;
  const communityId = args.input.communityId;

  const membership = ctx.memberships?.find((m) => m.communityId === communityId);
  if (!membership) return false;

  return membership.role === Role.OWNER;
});

const isCommunityManager = rule({ cache: "contextual" })(async (_parent, args, ctx: IContext) => {
  if (!ctx.currentUser || !args.input.communityId) return false;
  const communityId = args.input.communityId;

  const membership = ctx.memberships?.find((m) => m.communityId === communityId);
  if (!membership) return false;

  return membership.role === Role.OWNER || membership.role === Role.MANAGER;
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

const isOpportunityOwner = rule({ cache: "contextual" })(async (_parent, args, ctx: IContext) => {
  if (!ctx.currentUser || !args.input.opportunityId) return false;
  const opportunityId = args.input.opportunityId;

  return !!ctx.opportunitiesCreatedBy?.find((m) => m.id === opportunityId);
});

export {
  sanitizeInput,
  isAdmin,
  isUser,
  isAuthenticated,
  isSelf,
  isCommunityManager,
  isCommunityOwner,
  isCommunityMember,
  isOpportunityOwner,
};
