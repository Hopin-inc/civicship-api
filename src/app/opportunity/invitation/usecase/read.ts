import {
  GqlQueryOpportunityInvitationsArgs,
  GqlQueryOpportunityInvitationArgs,
  GqlOpportunityInvitationsConnection,
  GqlOpportunityInvitation,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { clampFirst } from "@/utils";
import OpportunityInvitationService from "@/app/opportunity/invitation/service";
import OpportunityInvitationOutputFormat from "@/presen/graphql/dto/opportunity/invitation/output";

export default class OpportunityInvitationReadUseCase {
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
}
