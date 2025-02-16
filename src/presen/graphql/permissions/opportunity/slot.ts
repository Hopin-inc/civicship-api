import { and, or } from "graphql-shield";
import {
  isCommunityManager,
  isOpportunityOwner,
  sanitizeInput,
} from "@/presen/graphql/permissions/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const opportunitySlotMutationPermissions: Record<string, ShieldRule> = {
  opportunitySlotsBulkUpdate: or(
    and(isCommunityManager, sanitizeInput),
    and(isOpportunityOwner, sanitizeInput),
  ),
};

export { opportunitySlotMutationPermissions };
