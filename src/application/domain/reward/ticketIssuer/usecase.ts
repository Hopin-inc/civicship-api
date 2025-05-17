import { inject, injectable } from "tsyringe";
import type {
  GqlQueryTicketIssuerArgs,
  GqlQueryTicketIssuersArgs,
  GqlTicketIssuer,
  GqlTicketIssuersConnection,
} from "@/types/graphql";
import TicketIssuerService from "@/application/domain/reward/ticketIssuer/service";
import { IContext } from "@/types/server";
import TicketIssuerPresenter from "@/application/domain/reward/ticketIssuer/presenter";
import { clampFirst } from "@/application/domain/utils";

@injectable()
export class TicketIssuerUseCase {
  constructor(
    @inject("TicketIssuerService") private readonly ticketIssuerService: TicketIssuerService,
  ) {}

  async visitorBrowseTicketIssuers(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryTicketIssuersArgs,
  ): Promise<GqlTicketIssuersConnection> {
    const take = clampFirst(first);
    const ticketIssuers = await this.ticketIssuerService.fetchTicketIssuers(
      ctx,
      { cursor, filter, sort },
      take,
    );

    const hasNextPage = ticketIssuers.length > take;
    const data = ticketIssuers.slice(0, take).map(TicketIssuerPresenter.get);
    return TicketIssuerPresenter.query(data, hasNextPage);
  }

  async visitorViewTicketIssuer(
    ctx: IContext,
    { id }: GqlQueryTicketIssuerArgs,
  ): Promise<GqlTicketIssuer | null> {
    const ticketIssuer = await this.ticketIssuerService.findTicketIssuer(ctx, id);
    if (!ticketIssuer) {
      return null;
    }
    return TicketIssuerPresenter.get(ticketIssuer);
  }
}
