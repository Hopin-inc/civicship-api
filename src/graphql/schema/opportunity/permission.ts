import {
  isCommunityManager,
  isCommunityMember,
  isOpportunityOwner,
} from "@/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";
import { or } from "graphql-shield";

const opportunityMutationPermissions: Record<string, ShieldRule> = {
  opportunityCreate: isCommunityMember,
  opportunityDelete: or(isCommunityManager, isOpportunityOwner),
  opportunityEditContent: or(isCommunityManager, isOpportunityOwner),

  opportunitySetPublishStatus: or(isCommunityManager, isOpportunityOwner),
};

export { opportunityMutationPermissions };
