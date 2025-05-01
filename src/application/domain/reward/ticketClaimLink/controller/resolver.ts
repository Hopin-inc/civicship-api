import { GqlQueryTicketClaimLinkArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import TicketClaimLinkUseCase from "@/application/domain/reward/ticketClaimLink/usecase";

@injectable()
export default class TicketClaimLinkResolver {
  constructor(@inject("TicketClaimLinkUseCase") private readonly usecase: TicketClaimLinkUseCase) {}

  Query = {
    ticketClaimLink: async (_: unknown, args: GqlQueryTicketClaimLinkArgs, ctx: IContext) => {
      return this.usecase.visitorViewTicketClaimLink(ctx, args.id);
    },
  };
}
