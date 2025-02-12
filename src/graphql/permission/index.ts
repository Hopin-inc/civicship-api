import { shield, allow } from "graphql-shield";
import { userPermission } from "@/graphql/schema/user/permission";

export const permissions = shield(
  {
    Query: {
      ...userPermission.Query,
    },
    Mutation: {
      ...userPermission.Mutation,
    },
  },
  {
    fallbackRule: allow,
    allowExternalErrors: true,
  },
);
