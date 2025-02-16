import {
  isCommunityMember,
  isCommunityOwner,
  sanitizeInput,
} from "@/presentation/graphql/permissions/rule";
import { ShieldRule } from "graphql-shield/typings/types";
import { and } from "graphql-shield";

const transactionMutationPermissions: Record<string, ShieldRule> = {
  transactionIssueCommunityPoint: and(isCommunityOwner, sanitizeInput),
  transactionGrantCommunityPoint: and(isCommunityOwner, sanitizeInput),

  transactionDonateSelfPoint: and(isCommunityMember, sanitizeInput),
};

export { transactionMutationPermissions };
