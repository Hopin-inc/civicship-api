import {
  GqlQueryTicketsArgs,
  GqlQueryTicketArgs,
  GqlMutationTicketPurchaseArgs,
  GqlMutationTicketUseArgs,
  GqlMutationTicketRefundArgs,
  GqlTicket,
  GqlTicketsConnection,
  GqlTicketPurchasePayload,
  GqlTicketUsePayload,
  GqlTicketRefundPayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TicketService from "@/application/ticket/service";
import TicketPresenter from "@/application/ticket/presenter";
import { TicketUtils } from "@/application/ticket/utils";

export default class TicketUseCase {
  static async visitorBrowseTickets(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryTicketsArgs,
  ): Promise<GqlTicketsConnection> {
    return TicketUtils.fetchTicketsCommon(ctx, { cursor, filter, sort, first });
  }

  static async visitorViewTicket(
    ctx: IContext,
    { id }: GqlQueryTicketArgs,
  ): Promise<GqlTicket | null> {
    const ticket = await TicketService.findTicket(ctx, id);
    if (!ticket) {
      return null;
    }
    return TicketPresenter.get(ticket);
  }

  static async memberPurchaseTicket(
    ctx: IContext,
    args: GqlMutationTicketPurchaseArgs,
  ): Promise<GqlTicketPurchasePayload> {
    const result = await TicketService.purchaseTicket(ctx, args.input);
    return TicketPresenter.purchase(result);
  }

  static async memberUseTicket(
    ctx: IContext,
    args: GqlMutationTicketUseArgs,
  ): Promise<GqlTicketUsePayload> {
    const result = await TicketService.useTicket(ctx, args.id, args.input);
    return TicketPresenter.use(result);
  }

  static async memberRefundTicket(
    ctx: IContext,
    args: GqlMutationTicketRefundArgs,
  ): Promise<GqlTicketRefundPayload> {
    const result = await TicketService.refundTicket(ctx, args.id, args.input);
    return TicketPresenter.refund(result);
  }
}
