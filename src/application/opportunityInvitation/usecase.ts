import {
  GqlQueryOpportunityInvitationsArgs,
  GqlQueryOpportunityInvitationArgs,
  GqlOpportunityInvitationsConnection,
  GqlOpportunityInvitation,
  GqlMutationOpportunityInvitationCreateArgs,
  GqlOpportunityInvitationCreatePayload,
  GqlMutationOpportunityInvitationDisableArgs,
  GqlOpportunityInvitationDisablePayload,
  GqlOpportunity,
  GqlOpportunityInvitationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityInvitationService from "@/application/opportunityInvitation/service";
import OpportunityInvitationPresenter from "@/application/opportunityInvitation/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import OpportunityInvitationUtils from "@/application/opportunityInvitation/utilis";

export default class OpportunityInvitationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseOpportunityInvitations(
    args: GqlQueryOpportunityInvitationsArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationsConnection> {
    return OpportunityInvitationUtils.fetchOpportunityInvitationsCommon(ctx, args);
  }

  static async visitorBrowseOpportunityInvitationsByOpportunity(
    { id }: GqlOpportunity,
    args: GqlOpportunityInvitationsArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationsConnection> {
    return OpportunityInvitationUtils.fetchOpportunityInvitationsCommon(ctx, {
      ...args,
      filter: { opportunityId: id },
    });
  }

  static async visitorViewOpportunityInvitation(
    { id }: GqlQueryOpportunityInvitationArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitation | null> {
    const invitation = await OpportunityInvitationService.findOpportunityInvitation(ctx, id);
    if (!invitation) return null;
    return OpportunityInvitationPresenter.get(invitation);
  }

  static async memberCreateOpportunityInvitation(
    { input }: GqlMutationOpportunityInvitationCreateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationCreatePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const invitation = await OpportunityInvitationService.createOpportunityInvitation(
        ctx,
        input,
        tx,
      );
      return OpportunityInvitationPresenter.create(invitation);
    });
  }

  static async memberDisableOpportunityInvitation(
    { id, input }: GqlMutationOpportunityInvitationDisableArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationDisablePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const invitation = await OpportunityInvitationService.disableOpportunityInvitation(
        ctx,
        id,
        input,
        tx,
      );
      return OpportunityInvitationPresenter.disable(invitation);
    });
  }
}
