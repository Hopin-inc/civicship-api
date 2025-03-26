import { shield, allow } from "graphql-shield";
import { userMutationPermissions } from "@/application/domain/user/controller/permission";
import { communityMutationPermissions } from "@/application/domain/community/controller/permission";
import { membershipMutationPermissions } from "@/application/domain/membership/controller/permission";
import { opportunityMutationPermissions } from "@/application/domain/opportunity/controller/permission";
import { participationMutationPermissions } from "@/application/domain/participation/controller/permission";
import { utilityMutationPermissions } from "@/application/domain/utility/controller/permission";
import { transactionMutationPermissions } from "@/application/domain/transaction/controller/permission";
import { opportunitySlotMutationPermissions } from "@/application/domain/opportunitySlot/controller/permission";
import { opportunityInvitationMutationPermissions } from "@/application/domain/invitation/controller/permission";
import { placeMutationPermissions } from "@/application/domain/place/controller/permission";
import { ticketMutationPermissions } from "@/application/domain/ticket/controller/permission";

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
