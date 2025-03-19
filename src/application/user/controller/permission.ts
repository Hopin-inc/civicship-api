import { isSelf, sanitizeInput } from "@/presentation/graphql/permission/rule";
import { and } from "graphql-shield";
import { ShieldRule } from "graphql-shield/typings/types";
import { GqlMutation } from "@/types/graphql";

const userMutationPermissions: Partial<Record<keyof GqlMutation, ShieldRule>> = {
  userDeleteMe: and(isSelf, sanitizeInput),
  userUpdateMyProfile: and(isSelf, sanitizeInput),
};

export { userMutationPermissions };
