import { isCommunityManager, isCommunityOwner, isSelf } from "@/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const membershipMutationPermissions: Record<string, ShieldRule> = {
  // invite
  membershipInvite: isCommunityManager,
  membershipCancelInvitation: isCommunityManager,
  membershipAcceptMyInvitation: isSelf,
  membershipDenyMyInvitation: isSelf,

  // join
  membershipWithdraw: isSelf,

  // role
  membershipAssignOwner: isCommunityOwner,
  membershipAssignManager: isCommunityManager,
  membershipAssignMember: isCommunityManager,
  membershipRemove: isCommunityOwner,
};

export { membershipMutationPermissions };
