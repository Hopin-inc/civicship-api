import { or, and } from "graphql-shield";
import {
  isCommunityManager,
  isCommunityMember,
  isOpportunityOwner,
  sanitizeInput,
} from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const opportunityMutationPermissions: Record<string, ShieldRule> = {
  opportunityCreate: and(isCommunityMember, sanitizeInput),
  opportunityDelete: or(
    and(isCommunityManager, sanitizeInput),
    and(isOpportunityOwner, sanitizeInput),
  ),
  opportunityUpdateContent: or(
    and(isCommunityManager, sanitizeInput),
    and(isOpportunityOwner, sanitizeInput),
  ),
  opportunitySetPublishStatus: or(
    and(isCommunityManager, sanitizeInput),
    and(isOpportunityOwner, sanitizeInput),
  ),
};

export { opportunityMutationPermissions };
