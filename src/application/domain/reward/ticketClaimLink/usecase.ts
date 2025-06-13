import TicketClaimLinkService from "@/application/domain/reward/ticketClaimLink/service";
import TicketClaimLinkPresenter from "@/application/domain/reward/ticketClaimLink/presenter";
import { IContext } from "@/types/server";
import { GqlTicketClaimLink, GqlQueryTicketClaimLinksArgs, GqlTicketClaimLinksConnection } from "@/types/graphql";
import { inject, injectable } from "tsyringe";

@injectable()
export default class TicketClaimLinkUseCase {
  constructor(
    @inject("TicketClaimLinkService")
    private readonly service: TicketClaimLinkService,
  ) {}

  async visitorBrowseTicketClaimLinks(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryTicketClaimLinksArgs,
  ): Promise<GqlTicketClaimLinksConnection> {
    return this.service.fetchTicketClaimLinks(ctx, { cursor, filter, sort, first });
  }

  async visitorViewTicketClaimLink(ctx: IContext, id: string): Promise<GqlTicketClaimLink | null> {
    const claimLink = await this.service.findTicketClaimLink(ctx, id);
    if (!claimLink) {
      return null;
    }
    return TicketClaimLinkPresenter.get(claimLink);
  }
}
