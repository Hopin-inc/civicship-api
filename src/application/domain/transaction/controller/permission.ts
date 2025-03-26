import {
  isCommunityMember,
  isCommunityOwner,
  sanitizeInput,
} from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";
import { and } from "graphql-shield";
import { GqlMutation } from "@/types/graphql";

const transactionMutationPermissions: Partial<Record<keyof GqlMutation, ShieldRule>> = {
  transactionIssueCommunityPoint: and(isCommunityOwner, sanitizeInput),
  transactionGrantCommunityPoint: and(isCommunityOwner, sanitizeInput),

  transactionDonateSelfPoint: and(isCommunityMember, sanitizeInput),
};

export { transactionMutationPermissions };
