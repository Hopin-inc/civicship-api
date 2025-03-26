import { isCommunityMember, sanitizeInput } from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";
import { and } from "graphql-shield";
import { GqlMutation } from "@/types/graphql";

const utilityMutationPermissions: Partial<Record<keyof GqlMutation, ShieldRule>> = {
  utilityCreate: and(isCommunityMember, sanitizeInput),
  utilityDelete: and(isCommunityMember, sanitizeInput),
  utilityUpdateInfo: and(isCommunityMember, sanitizeInput),
};

export { utilityMutationPermissions };
