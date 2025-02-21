import { and } from "graphql-shield";
import {
  isCommunityManager,
  isCommunityOwner,
  isSelf,
  sanitizeInput,
} from "@/presentation/graphql/permissions/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const membershipMutationPermissions: Record<string, ShieldRule> = {
  //invite
  membershipInvite: and(isCommunityManager, sanitizeInput),
  membershipCancelInvitation: and(isCommunityManager, sanitizeInput),
  membershipAcceptMyInvitation: and(isSelf, sanitizeInput),
  membershipDenyMyInvitation: and(isSelf, sanitizeInput),

  //self
  membershipWithdraw: and(isSelf, sanitizeInput),

  //role
  membershipAssignOwner: and(isCommunityOwner, sanitizeInput),
  membershipAssignManager: and(isCommunityManager, sanitizeInput),
  membershipAssignMember: and(isCommunityManager, sanitizeInput),
  membershipRemove: and(isCommunityOwner, sanitizeInput),
};

export { membershipMutationPermissions };
