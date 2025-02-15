import { shield, allow } from "graphql-shield";
import { userMutationPermissions, userQueryPermissions } from "@/graphql/permission/user";
import { communityMutationPermissions } from "@/graphql/permission/community";
import { membershipMutationPermissions } from "@/graphql/permission/membership";
import { opportunityMutationPermissions } from "@/graphql/permission/opportunity";
import { participationMutationPermissions } from "@/graphql/permission/opportunity/participation";
import { utilityMutationPermissions } from "@/graphql/permission/utility";
import { transactionMutationPermissions } from "@/graphql/permission/transaction";
import { opportunitySlotMutationPermissions } from "@/graphql/permission/opportunity/slot";

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
      ...opportunitySlotMutationPermissions,
    },
  },
  {
    fallbackRule: allow,
    debug: process.env.ENV === "LOCAL",
  },
);

export default permissions;
