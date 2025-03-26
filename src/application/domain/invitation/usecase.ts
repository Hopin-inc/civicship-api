import {
  GqlQueryOpportunityInvitationsArgs,
  GqlQueryOpportunityInvitationArgs,
  GqlOpportunityInvitationsConnection,
  GqlOpportunityInvitation,
  GqlMutationOpportunityInvitationCreateArgs,
  GqlOpportunityInvitationCreatePayload,
  GqlMutationOpportunityInvitationDisableArgs,
  GqlOpportunityInvitationDisablePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityInvitationService from "@/application/domain/invitation/service";
import OpportunityInvitationPresenter from "@/application/domain/invitation/presenter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { clampFirst } from "@/application/domain/utils";

export default class OpportunityInvitationUseCase {
  private static issuer = new PrismaClientIssuer();

  static async visitorBrowseOpportunityInvitations(
    { filter, sort, cursor, first }: GqlQueryOpportunityInvitationsArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationsConnection> {
    const take = clampFirst(first);

    const records = await OpportunityInvitationService.fetchOpportunityInvitations(
      ctx,
      {
        filter,
        sort,
        cursor,
      },
      take,
    );
    const hasNextPage = records.length > take;
    const data = records.slice(0, take).map((record) => OpportunityInvitationPresenter.get(record));

    return OpportunityInvitationPresenter.query(data, hasNextPage);
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
    { id }: GqlMutationOpportunityInvitationDisableArgs,
    ctx: IContext,
  ): Promise<GqlOpportunityInvitationDisablePayload> {
    return this.issuer.public(ctx, async (tx) => {
      const invitation = await OpportunityInvitationService.disableOpportunityInvitation(
        ctx,
        id,
        tx,
      );
      return OpportunityInvitationPresenter.disable(invitation);
    });
  }
}
