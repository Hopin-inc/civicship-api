import { shield, allow } from "graphql-shield";
import { userMutationPermissions, userQueryPermissions } from "@/graphql/permission/user";
import { communityMutationPermissions } from "@/graphql/permission/community";
import { membershipMutationPermissions } from "@/graphql/permission/membership";
import { opportunityMutationPermissions } from "@/graphql/permission/opportunity/opportunity";
import { participationMutationPermissions } from "@/graphql/permission/opportunity/participation";
import { utilityMutationPermissions } from "@/graphql/permission/utility";
import { transactionMutationPermissions } from "@/graphql/permission/transaction";

const permissions = shield(
  {
    Query: {
      ...userQueryPermissions,
    },
    Mutation: {
      ...userMutationPermissions,
      ...communityMutationPermissions,
      ...membershipMutationPermissions,
      ...opportunityMutationPermissions,
      ...participationMutationPermissions,
      ...utilityMutationPermissions,
      ...transactionMutationPermissions,
    },
  },
  {
    fallbackRule: allow,
    debug: process.env.ENV === "LOCAL",
  },
);

export default permissions;
