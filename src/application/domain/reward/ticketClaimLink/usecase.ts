import TicketClaimLinkService from "@/application/domain/reward/ticketClaimLink/service";
import TicketClaimLinkPresenter from "@/application/domain/reward/ticketClaimLink/presenter";
import { IContext } from "@/types/server";
import { GqlTicketClaimLink } from "@/types/graphql";

export default class TicketClaimLinkUseCase {
  static async visitorViewTicketClaimLink(
    ctx: IContext,
    id: string,
  ): Promise<GqlTicketClaimLink | null> {
    const claimLink = await TicketClaimLinkService.findTicketClaimLink(ctx, id);
    if (!claimLink) {
      return null;
    }
    return TicketClaimLinkPresenter.get(claimLink);
  }
}
