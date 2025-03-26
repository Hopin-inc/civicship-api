import { and } from "graphql-shield";
import {
  isCommunityManager,
  isCommunityMember,
  sanitizeInput,
} from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";
import { GqlMutation } from "@/types/graphql";

const opportunityInvitationMutationPermissions: Partial<Record<keyof GqlMutation, ShieldRule>> = {
  opportunityInvitationCreate: and(isCommunityMember, sanitizeInput),
  opportunityInvitationDisable: and(isCommunityManager, sanitizeInput),
};

export { opportunityInvitationMutationPermissions };
