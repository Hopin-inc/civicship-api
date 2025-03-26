import { and } from "graphql-shield";
import { isCommunityManager, sanitizeInput } from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";
import { GqlMutation } from "@/types/graphql";

const placeMutationPermissions: Partial<Record<keyof GqlMutation, ShieldRule>> = {
  placeCreate: and(isCommunityManager, sanitizeInput),
  placeUpdate: and(isCommunityManager, sanitizeInput),
  placeDelete: and(isCommunityManager, sanitizeInput),
};

export { placeMutationPermissions };
