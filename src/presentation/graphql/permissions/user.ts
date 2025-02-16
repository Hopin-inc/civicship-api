import { isAdmin, isSelf, sanitizeInput } from "@/presentation/graphql/permissions/rule";
import { and } from "graphql-shield";
import { ShieldRule } from "graphql-shield/typings/types";

const userQueryPermissions: Record<string, ShieldRule> = {
  users: isAdmin,
};

const userMutationPermissions: Record<string, ShieldRule> = {
  userDeleteMe: and(isSelf, sanitizeInput),
  userUpdateMyProfile: and(isSelf, sanitizeInput),
};

export { userQueryPermissions, userMutationPermissions };
