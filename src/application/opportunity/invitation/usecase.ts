import {
  GqlQueryOpportunityInvitationsArgs,
  GqlQueryOpportunityInvitationArgs,
  GqlMutationOpportunityInvitationCreateArgs,
  GqlMutationOpportunityInvitationDisableArgs,
  GqlMutationOpportunityInvitationDeleteArgs,
  GqlOpportunityInvitationsConnection,
  GqlOpportunityInvitation,
  GqlOpportunityInvitationCreatePayload,
  GqlOpportunityInvitationDisablePayload,
  GqlOpportunityInvitationDeletePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { clampFirst } from "@/utils";
import OpportunityInvitationService from "@/application/opportunity/invitation/service";
import OpportunityInvitationOutputFormat from "@/presentation/graphql/dto/opportunity/invitation/output";

export default class OpportunityInvitationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseOpportunityInvitations(
    { filter, sort, cursor, first }: GqlQueryOpportunityInvitationsArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationsConnection> {
    const take = clampFirst(first);
    const rows = await OpportunityInvitationService.fetchOpportunityInvitations(
      ctx,
      { filter, sort, cursor },
      take,
    );
    const hasNextPage = rows.length > take;
    const data = rows.slice(0, take).map((record) => OpportunityInvitationOutputFormat.get(record));
    return OpportunityInvitationOutputFormat.query(data, hasNextPage);
  }

  static async visitorViewOpportunityInvitation(
    { id }: GqlQueryOpportunityInvitationArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitation | null> {
    const invitation = await OpportunityInvitationService.findOpportunityInvitation(ctx, id);
    if (!invitation) return null;
    return OpportunityInvitationOutputFormat.get(invitation);
  }

  static async managerCreateOpportunityInvitation(
    { input }: GqlMutationOpportunityInvitationCreateArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationCreatePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const invitation = await OpportunityInvitationService.createOpportunityInvitation(
        ctx,
        input,
        tx,
      );
      return OpportunityInvitationOutputFormat.create(invitation);
    });
  }

  static async managerDisableOpportunityInvitation(
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
      return OpportunityInvitationOutputFormat.disable(invitation);
    });
  }

  static async managerDeleteOpportunityInvitation(
    { id }: GqlMutationOpportunityInvitationDeleteArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationDeletePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const invitation = await OpportunityInvitationService.deleteOpportunityInvitation(
        ctx,
        id,
        tx,
      );
      return OpportunityInvitationOutputFormat.delete(invitation);
    });
  }
}
