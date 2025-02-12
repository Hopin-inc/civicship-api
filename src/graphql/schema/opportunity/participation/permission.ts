import {
  isAuthenticated,
  isCommunityManager,
  isCommunityMember,
  isOpportunityOwner,
  isSelf,
} from "@/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";
import { or } from "graphql-shield";

const participationMutationPermissions: Record<string, ShieldRule> = {
  // invite
  participationInvite: isCommunityMember,
  participationCancelInvitation: isCommunityMember,
  participationAcceptMyInvitation: isSelf,
  participationDenyMyInvitation: isSelf,

  // apply
  participationApply: isAuthenticated,
  participationCancelMyApplication: isSelf,
  participationAcceptApplication: or(isCommunityManager, isOpportunityOwner),
  participationDenyApplication: or(isCommunityManager, isOpportunityOwner),

  //performance
  participationApprovePerformance: or(isCommunityManager, isOpportunityOwner),
  participationDenyPerformance: or(isCommunityManager, isOpportunityOwner),
};

export { participationMutationPermissions };
