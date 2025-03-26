import { and, or } from "graphql-shield";
import {
  isCommunityManager,
  isOpportunityOwner,
  sanitizeInput,
} from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";
import { GqlMutation } from "@/types/graphql";

const opportunitySlotMutationPermissions: Partial<Record<keyof GqlMutation, ShieldRule>> = {
  opportunitySlotsBulkUpdate: or(
    and(isCommunityManager, sanitizeInput),
    and(isOpportunityOwner, sanitizeInput),
  ),
};

export { opportunitySlotMutationPermissions };
