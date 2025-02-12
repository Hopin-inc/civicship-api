import { isCommunityOwner, isCommunityOwnerOrManager, isSelf } from "@/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const membershipMutationPermissions: Record<string, ShieldRule> = {
  // invite
  membershipInvite: isCommunityOwnerOrManager,
  membershipCancelInvitation: isCommunityOwnerOrManager,
  membershipAcceptMyInvitation: isSelf,
  membershipDenyMyInvitation: isSelf,

  // join
  membershipWithdraw: isSelf,

  // role
  membershipAssignOwner: isCommunityOwner,
  membershipAssignManager: isCommunityOwnerOrManager,
  membershipAssignMember: isCommunityOwnerOrManager,
  membershipRemove: isCommunityOwner,
};

export { membershipMutationPermissions };
