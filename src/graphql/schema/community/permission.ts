import { isAuthenticated, isCommunityOwner } from "@/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const communityMutationPermissions: Record<string, ShieldRule> = {
  communityCreate: isAuthenticated,
  communityDelete: isCommunityOwner,
  communityUpdateProfile: isCommunityOwner,
};

export { communityMutationPermissions };
