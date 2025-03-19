import { and } from "graphql-shield";
import {
  isAuthenticated,
  isCommunityManager,
  isCommunityOwner,
  sanitizeInput,
} from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";
import { GqlMutation } from "@/types/graphql";

const communityMutationPermissions: Partial<Record<keyof GqlMutation, ShieldRule>> = {
  communityCreate: and(isAuthenticated, sanitizeInput),
  communityDelete: and(isCommunityOwner, sanitizeInput),
  communityUpdateProfile: and(isCommunityManager, sanitizeInput),
};

export { communityMutationPermissions };
