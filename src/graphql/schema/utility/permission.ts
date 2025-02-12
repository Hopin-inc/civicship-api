import { isAuthenticated, isCommunityMember } from "@/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const utilityMutationPermissions: Record<string, ShieldRule> = {
  utilityCreate: isCommunityMember,
  utilityDelete: isCommunityMember,
  utilityUpdateInfo: isCommunityMember,

  utilityGet: isAuthenticated,
  utilityUse: isAuthenticated,
};

export { utilityMutationPermissions };
