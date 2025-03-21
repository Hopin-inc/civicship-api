import { shield, allow } from "graphql-shield";
import { userMutationPermissions } from "@/application/user/controller/permission";
import { communityMutationPermissions } from "@/application/community/controller/permission";
import { membershipMutationPermissions } from "@/application/membership/controller/permission";
import { opportunityMutationPermissions } from "@/application/opportunity/controller/permission";
import { participationMutationPermissions } from "@/application/participation/controller/permission";
import { utilityMutationPermissions } from "@/application/utility/controller/permission";
import { transactionMutationPermissions } from "@/application/transaction/controller/permission";
import { opportunitySlotMutationPermissions } from "@/application/opportunitySlot/controller/permission";
import { opportunityInvitationMutationPermissions } from "@/application/invitation/controller/permission";
import { placeMutationPermissions } from "@/application/place/controller/permission";
import { ticketMutationPermissions } from "@/application/ticket/controller/permission";

const permissions = shield(
  {
    Mutation: {
      ...userMutationPermissions,

      ...communityMutationPermissions,
      ...membershipMutationPermissions,

      ...opportunityMutationPermissions,
      ...opportunitySlotMutationPermissions,
      ...opportunityInvitationMutationPermissions,
      ...participationMutationPermissions,

      ...utilityMutationPermissions,
      ...ticketMutationPermissions,

      ...placeMutationPermissions,
      ...transactionMutationPermissions,
    },
  },
  {
    fallbackRule: allow,
    debug: process.env.ENV === "LOCAL",
  },
);

export default permissions;
