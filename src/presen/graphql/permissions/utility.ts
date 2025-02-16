import {
  isAuthenticated,
  isCommunityMember,
  sanitizeInput,
} from "@/presen/graphql/permissions/rule";
import { ShieldRule } from "graphql-shield/typings/types";
import { and } from "graphql-shield";

const utilityMutationPermissions: Record<string, ShieldRule> = {
  utilityCreate: and(isAuthenticated, isCommunityMember, sanitizeInput),
  utilityDelete: and(isAuthenticated, isCommunityMember, sanitizeInput),
  utilityUpdateInfo: and(isAuthenticated, isCommunityMember, sanitizeInput),
  utilityUse: and(isAuthenticated, isCommunityMember, sanitizeInput),
};

export { utilityMutationPermissions };
