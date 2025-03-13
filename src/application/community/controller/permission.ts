import { and } from "graphql-shield";
import {
  isAuthenticated,
  isCommunityManager,
  isCommunityOwner,
  sanitizeInput,
} from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const communityMutationPermissions: Record<string, ShieldRule> = {
  communityCreate: and(isAuthenticated, sanitizeInput),
  communityDelete: and(isCommunityOwner, sanitizeInput),
  communityUpdateProfile: and(isCommunityManager, sanitizeInput),
};

export { communityMutationPermissions };
