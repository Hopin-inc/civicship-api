import { or, and } from "graphql-shield";
import {
  isAuthenticated,
  isCommunityManager,
  isCommunityMember,
  isOpportunityOwner,
  isSelf,
  sanitizeInput,
} from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const participationMutationPermissions: Record<string, ShieldRule> = {
  // invite
  participationInvite: and(isCommunityMember, sanitizeInput),
  participationCancelInvitation: and(isCommunityMember, sanitizeInput),
  participationAcceptMyInvitation: and(isSelf, sanitizeInput),
  participationDenyMyInvitation: and(isSelf, sanitizeInput),

  // apply
  participationApply: and(isAuthenticated, sanitizeInput),
  participationCancelMyApplication: and(isSelf, sanitizeInput),
  participationAcceptApplication: or(
    and(isCommunityManager, sanitizeInput),
    and(isOpportunityOwner, sanitizeInput),
  ),
  participationDenyApplication: or(
    and(isCommunityManager, sanitizeInput),
    and(isOpportunityOwner, sanitizeInput),
  ),

  // performance
  participationApprovePerformance: or(
    and(isCommunityManager, sanitizeInput),
    and(isOpportunityOwner, sanitizeInput),
  ),
  participationDenyPerformance: or(
    and(isCommunityManager, sanitizeInput),
    and(isOpportunityOwner, sanitizeInput),
  ),
};

export { participationMutationPermissions };
