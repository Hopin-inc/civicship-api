import { and } from "graphql-shield";
import {
  isCommunityManager,
  isCommunityMember,
  sanitizeInput,
} from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const opportunityInvitationMutationPermissions: Record<string, ShieldRule> = {
  opportunityInvitationCreate: and(isCommunityMember, sanitizeInput),
  opportunityInvitationDisable: and(isCommunityManager, sanitizeInput),
};

export { opportunityInvitationMutationPermissions };
