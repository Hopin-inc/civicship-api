import { isSelf, sanitizeInput } from "@/presentation/graphql/permission/rule";
import { and } from "graphql-shield";
import { ShieldRule } from "graphql-shield/typings/types";

const userMutationPermissions: Record<string, ShieldRule> = {
  userDeleteMe: and(isSelf, sanitizeInput),
  userUpdateMyProfile: and(isSelf, sanitizeInput),
};

export { userMutationPermissions };
