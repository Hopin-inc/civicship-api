import { shield, allow } from "graphql-shield";
import { userMutationPermissions, userQueryPermissions } from "@/presen/graphql/permissions/user";
import { communityMutationPermissions } from "@/presen/graphql/permissions/community";
import { membershipMutationPermissions } from "@/presen/graphql/permissions/membership";
import { opportunityMutationPermissions } from "@/presen/graphql/permissions/opportunity";
import { participationMutationPermissions } from "@/presen/graphql/permissions/opportunity/participation";
import { utilityMutationPermissions } from "@/presen/graphql/permissions/utility";
import { transactionMutationPermissions } from "@/presen/graphql/permissions/transaction";
import { opportunitySlotMutationPermissions } from "@/presen/graphql/permissions/opportunity/slot";

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
