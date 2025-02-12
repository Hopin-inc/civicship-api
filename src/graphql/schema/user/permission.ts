import { isAdmin, isSelf } from "@/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const userQueryPermissions: Record<string, ShieldRule> = {
  users: isAdmin,
};

const userMutationPermissions: Record<string, ShieldRule> = {
  userDeleteMe: isSelf,
  userUpdateMyProfile: isSelf,
};

export { userQueryPermissions, userMutationPermissions };
