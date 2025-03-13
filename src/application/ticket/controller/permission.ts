import { and } from "graphql-shield";
import { isCommunityMember, isSelf, sanitizeInput } from "@/presentation/graphql/permission/rule";
import { ShieldRule } from "graphql-shield/typings/types";

const ticketMutationPermissions: Record<string, ShieldRule> = {
  ticketPurchase: and(isCommunityMember, sanitizeInput),
  ticketUse: and(isSelf, isCommunityMember, sanitizeInput),
  ticketRefund: and(isSelf, isCommunityMember, sanitizeInput),
};

export { ticketMutationPermissions };
