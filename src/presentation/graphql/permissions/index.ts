import { shield, allow } from "graphql-shield";
import {
  userMutationPermissions,
  userQueryPermissions,
} from "@/presentation/graphql/permissions/user";
import { communityMutationPermissions } from "@/presentation/graphql/permissions/community";
import { membershipMutationPermissions } from "@/presentation/graphql/permissions/membership";
import { opportunityMutationPermissions } from "src/presentation/graphql/permissions/opportunity";
import { participationMutationPermissions } from "@/presentation/graphql/permissions/opportunity/participation";
import { utilityMutationPermissions } from "@/presentation/graphql/permissions/utility";
import { transactionMutationPermissions } from "@/presentation/graphql/permissions/transaction";
import { opportunitySlotMutationPermissions } from "@/presentation/graphql/permissions/opportunity/slot";

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
