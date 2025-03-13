import { and } from "graphql-shield";
import { isCommunityManager, sanitizeInput } from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const placeMutationPermissions: Record<string, ShieldRule> = {
  placeCreate: and(isCommunityManager, sanitizeInput),
  placeUpdate: and(isCommunityManager, sanitizeInput),
  placeDelete: and(isCommunityManager, sanitizeInput),
};

export { placeMutationPermissions };
