import { shield, allow } from "graphql-shield";
import {
  userMutationPermissions,
  userQueryPermissions,
} from "@/application/user/controller/permission";
import { communityMutationPermissions } from "@/application/community/controller/permission";
import { membershipMutationPermissions } from "@/application/membership/controller/permission";
import { opportunityMutationPermissions } from "@/application/opportunity/controller/permission";
import { participationMutationPermissions } from "@/application/participation/controller/permission";
import { utilityMutationPermissions } from "@/application/utility/controller/permission";
import { transactionMutationPermissions } from "@/application/transaction/controller/permission";
import { opportunitySlotMutationPermissions } from "@/application/opportunitySlot/controller/permission";

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
