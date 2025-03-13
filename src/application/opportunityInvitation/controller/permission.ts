import { and, or } from "graphql-shield";
import {
  isCommunityManager,
  isCommunityMember,
  isOpportunityInvitationOwner,
  sanitizeInput,
} from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const opportunityInvitationMutationPermissions: Record<string, ShieldRule> = {
  opportunityInvitationCreate: and(isCommunityMember, sanitizeInput),
  opportunityInvitationDisable: or(
    and(isCommunityManager, sanitizeInput),
    and(isOpportunityInvitationOwner, sanitizeInput),
  ),
};

export { opportunityInvitationMutationPermissions };
