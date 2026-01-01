import { IContext } from "@/types/server";
import { container } from "tsyringe";
import OpportunityService from "@/application/domain/experience/opportunity/service";
import { Role } from "@prisma/client";

/* =========================
 * Community helpers
 * ========================= */

export function getCommunityMembership(context: IContext, communityId: string) {
  const user = context.currentUser;
  if (!user) return null;

  return user.memberships?.find((m) => m.communityId === communityId) ?? null;
}

export function isCommunityOwner(context: IContext, communityId: string): boolean {
  const membership = getCommunityMembership(context, communityId);
  return membership?.role === Role.OWNER;
}

export function isCommunityManager(context: IContext, communityId: string): boolean {
  const membership = getCommunityMembership(context, communityId);
  return membership?.role === Role.OWNER || membership?.role === Role.MANAGER;
}

export function isCommunityMember(context: IContext, communityId: string): boolean {
  const membership = getCommunityMembership(context, communityId);
  return (
    membership?.role === Role.OWNER ||
    membership?.role === Role.MANAGER ||
    membership?.role === Role.MEMBER
  );
}

/* =========================
 * Opportunity helpers
 * ========================= */

export async function canManageOpportunity(
  context: IContext,
  opportunityId: string,
): Promise<{
  allowed: boolean;
  communityId: string | null;
  membershipRole: Role | null;
  isOpportunityOwner: boolean;
}> {
  const user = context.currentUser;
  if (!user) {
    return {
      allowed: false,
      communityId: null,
      membershipRole: null,
      isOpportunityOwner: false,
    };
  }

  const opportunityService = container.resolve<OpportunityService>("OpportunityService");
  const opportunity = await opportunityService.findOpportunity(context, opportunityId);

  if (!opportunity) {
    return {
      allowed: false,
      communityId: null,
      membershipRole: null,
      isOpportunityOwner: false,
    };
  }

  // Check for ownership from the fetched opportunity data
  const isOpportunityOwner = opportunity.createdBy === user.id;
  if (isOpportunityOwner) {
    return {
      allowed: true,
      communityId: opportunity.communityId,
      membershipRole: null,
      isOpportunityOwner: true,
    };
  }

  // Check for community manager role
  const communityId = opportunity.communityId;
  if (!communityId) {
    return {
      allowed: false,
      communityId: null,
      membershipRole: null,
      isOpportunityOwner: false,
    };
  }

  const isManager = isCommunityManager(context, communityId);
  const membership = getCommunityMembership(context, communityId);

  return {
    allowed: isManager,
    communityId,
    membershipRole: membership?.role ?? null,
    isOpportunityOwner: false,
  };
}
