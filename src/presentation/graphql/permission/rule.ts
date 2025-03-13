import { IContext } from "@/types/server";
import { or, rule } from "graphql-shield";
import { Role } from "@prisma/client";
import sanitize from "sanitize-html";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/errors/graphql";

// Check if the current user is an admin.
// First, ensure the user is logged in; if not, throw an AuthenticationError.
// Then, verify the user's system role is "SYS_ADMIN"; if not, throw an AuthorizationError.
const isAdmin = rule({ cache: "contextual" })(async (_parent, _args, ctx: IContext) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError("User must be logged in");
  }
  if (ctx.currentUser.sysRole !== "SYS_ADMIN") {
    throw new AuthorizationError("User must be admin");
  }
  return true;
});

// Check if a user is logged in.
// If the user is not logged in, throw an AuthenticationError.
const isUser = rule({ cache: "contextual" })(async (_parent, _args, ctx: IContext) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError("User must be logged in");
  }
  return true;
});

// Combines isUser and isAdmin to validate that the user is authenticated.
const isAuthenticated = or(isUser, isAdmin);

// Check if the user is performing an operation on their own account.
// Throws AuthenticationError if the user is not logged in.
// Throws AuthorizationError if the logged-in user's id does not match the provided userId.
const isSelf = rule({ cache: "contextual" })(async (_parent, args, ctx: IContext) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError("User must be logged in");
  }
  if (ctx.currentUser.id !== args.input.userId) {
    throw new AuthorizationError("User is not self");
  }
  return true;
});

// Check if the user is the owner of a community.
// Validates that the user is logged in and that a communityId is provided.
// Then checks membership: if the user is not a member or if the role is not OWNER, an error is thrown.
const isCommunityOwner = rule({ cache: "contextual" })(async (_parent, args, ctx: IContext) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError("User must be logged in");
  }
  if (!args.input.communityId) {
    throw new ValidationError("Community ID is required");
  }
  const communityId = args.input.communityId;
  const membership = ctx.memberships?.find((m) => m.communityId === communityId);
  if (!membership) {
    throw new AuthorizationError("User is not a member of the community");
  }
  if (membership.role !== Role.OWNER) {
    throw new AuthorizationError("User must be community owner");
  }
  return true;
});

// Check if the user is a community manager.
// Validates that the user is logged in and that a communityId is provided.
// Then verifies that the user's membership role is either OWNER or MANAGER.
const isCommunityManager = rule({ cache: "contextual" })(async (_parent, args, ctx: IContext) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError("User must be logged in");
  }
  if (!args.input.communityId) {
    throw new ValidationError("Community ID is required");
  }
  const communityId = args.input.communityId;
  const membership = ctx.memberships?.find((m) => m.communityId === communityId);
  if (!membership) {
    throw new AuthorizationError("User is not a member of the community");
  }
  if (!(membership.role === Role.OWNER || membership.role === Role.MANAGER)) {
    throw new AuthorizationError("User must be community manager");
  }
  return true;
});

// Check if the user is a community member.
// Validates that the user is logged in and that a communityId is provided.
// Then verifies that the user's membership role is one of OWNER, MANAGER, or MEMBER.
const isCommunityMember = rule({ cache: "contextual" })(async (_parent, args, ctx: IContext) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError("User must be logged in");
  }
  if (!args.input.communityId) {
    throw new ValidationError("Community ID is required");
  }
  const communityId = args.input.communityId;
  const membership = ctx.memberships?.find((m) => m.communityId === communityId);
  if (!membership) {
    throw new AuthorizationError("User is not a member of the community");
  }
  if (
    !(
      membership.role === Role.OWNER ||
      membership.role === Role.MANAGER ||
      membership.role === Role.MEMBER
    )
  ) {
    throw new AuthorizationError("User must be a community member");
  }
  return true;
});

// Check if the user is the owner of an opportunity.
// Validates that the user is logged in and that an opportunityId is provided.
// Then verifies that the opportunity is among those created by the user.
const isOpportunityOwner = rule({ cache: "contextual" })(async (_parent, args, ctx: IContext) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError("User must be logged in");
  }
  if (!args.input.opportunityId) {
    throw new ValidationError("Opportunity ID is required");
  }
  const opportunityId = args.input.opportunityId;
  if (!ctx.opportunitiesCreatedBy?.find((m) => m.id === opportunityId)) {
    throw new AuthorizationError("User is not the opportunity owner");
  }
  return true;
});

// Check if the user is the owner of an opportunity.
// Validates that the user is logged in and that an opportunityId is provided.
// Then verifies that the opportunity is among those created by the user.
const isOpportunityInvitationOwner = rule({ cache: "contextual" })(async (
  _parent,
  args,
  ctx: IContext,
) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError("User must be logged in");
  }
  if (!args.id) {
    throw new ValidationError("OpportunityInvitation ID is required");
  }
  const opportunityInvitationId = args.id;
  if (!ctx.opportunityInvitationCreatedBy.find((m) => m.id === opportunityInvitationId)) {
    throw new AuthorizationError("User is not the opportunity owner");
  }
  return true;
});

// Validate the input by sanitizing it. Throws an error if disallowed HTML tags are detected.
const sanitizeInput = rule()(async (parent, { input }) => {
  recursiveSanitize(input);
  return true;
});

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
    return input.map((item) => recursiveSanitize(item));
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
  isOpportunityInvitationOwner,
};
