import { isAdmin, isNotAuthenticated, isSelf } from "@/graphql/permission/rule";
import { IRuleTypeMap } from "graphql-shield/typings/types";

export const userPermission: IRuleTypeMap = {
  Query: {
    users: isAdmin,
    user: isNotAuthenticated,
    currentUser: isSelf,
  },
  Mutation: {
    createUser: isNotAuthenticated,
    deleteUser: isSelf,
    userUpdateProfile: isSelf,
  },
  User: {
    sysRole: isAdmin,
  },
};
