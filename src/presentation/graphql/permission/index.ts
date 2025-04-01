import { userMutationPermissions } from "@/application/domain/user/controller/permission";
import { allow, shield } from "graphql-shield";
import { communityMutationPermissions } from "@/application/domain/community/controller/permission";
import { membershipMutationPermissions } from "@/application/domain/membership/controller/permission";
import { opportunityMutationPermissions } from "@/application/domain/opportunity/controller/permission";
import { opportunitySlotMutationPermissions } from "@/application/domain/opportunitySlot/controller/permission";
import { participationMutationPermissions } from "@/application/domain/participation/controller/permission";
import { utilityMutationPermissions } from "@/application/domain/utility/controller/permission";
import { ticketMutationPermissions } from "@/application/domain/ticket/controller/permission";
import { placeMutationPermissions } from "@/application/domain/place/controller/permission";
import { transactionMutationPermissions } from "@/application/domain/transaction/controller/permission";

export const permissionRules = {
  Mutation: {
    ...userMutationPermissions,

    ...communityMutationPermissions,
    ...membershipMutationPermissions,

    ...opportunityMutationPermissions,
    ...opportunitySlotMutationPermissions,
    ...participationMutationPermissions,

    ...utilityMutationPermissions,
    ...ticketMutationPermissions,

    ...placeMutationPermissions,
    ...transactionMutationPermissions,
  },
};

const permissions = shield(permissionRules, {
  fallbackRule: allow,
  debug: process.env.ENV === "LOCAL",
});

export default permissions;
