import { shield, rule, allow, and } from "graphql-shield";
import { GqlRole } from "@/types/graphql";

const isAuthenticated = rule({ cache: "contextual" })(async (parent, args, { user }) => {
  return !!user;
});
const canSeePrivateData = rule({ cache: "strict" })(async (parent, args, { user }) => {
  return user.role === GqlRole.SysAdmin || user.organization.id === parent.organization.id;
});
const canSeePersonalData = rule({ cache: "strict" })(async (parent, args, { user }) => {
  return user.role === GqlRole.SysAdmin
    || user.id === parent.user.id
    || (user.role === GqlRole.Owner && user.organization.id === parent.organization.id);
});

export const permissions = shield({
  User: {
    lastName: and(isAuthenticated, canSeePrivateData, canSeePersonalData),
  },
}, {
  fallbackRule: allow
});
