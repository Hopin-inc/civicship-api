import { isCommunityMember, sanitizeInput } from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";
import { and } from "graphql-shield";

const utilityMutationPermissions: Record<string, ShieldRule> = {
  utilityCreate: and(isCommunityMember, sanitizeInput),
  utilityDelete: and(isCommunityMember, sanitizeInput),
  utilityUpdateInfo: and(isCommunityMember, sanitizeInput),
};

export { utilityMutationPermissions };
