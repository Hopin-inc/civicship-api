import { and } from "graphql-shield";
import { isAuthenticated, isCommunityOwner, sanitizeInput } from "@/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const communityMutationPermissions: Record<string, ShieldRule> = {
  communityCreate: and(isAuthenticated, sanitizeInput),
  communityDelete: and(isCommunityOwner, sanitizeInput),
  communityUpdateProfile: and(isCommunityOwner, sanitizeInput),
};

export { communityMutationPermissions };
