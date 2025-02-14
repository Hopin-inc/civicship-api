import { isCommunityMember, isCommunityOwner } from "@/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const transactionMutationPermissions: Record<string, ShieldRule> = {
  transactionIssueCommunityPoint: isCommunityOwner,
  transactionGrantCommunityPoint: isCommunityOwner,

  transactionDonateSelfPoint: isCommunityMember,
};

export { transactionMutationPermissions };
