import { shield, allow } from "graphql-shield";
import { userMutationPermissions, userQueryPermissions } from "@/graphql/schema/user/permission";
import { communityMutationPermissions } from "@/graphql/schema/community/permission";
import { membershipMutationPermissions } from "@/graphql/schema/membership/permission";
import { opportunityMutationPermissions } from "@/graphql/schema/opportunity/permission";
import { participationMutationPermissions } from "@/graphql/schema/opportunity/participation/permission";
import { utilityMutationPermissions } from "@/graphql/schema/utility/permission";
import { transactionMutationPermissions } from "@/graphql/schema/transaction/permission";

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
