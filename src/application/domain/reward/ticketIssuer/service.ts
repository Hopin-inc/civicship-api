import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { ITicketIssuerRepository, ITicketIssuerService } from "./data/interface";
import { NotFoundError } from "@/errors/graphql";
import TicketIssuerConverter from "@/application/domain/reward/ticketIssuer/data/converter";

@injectable()
export default class TicketIssuerService implements ITicketIssuerService {
  constructor(
    @inject("TicketIssuerRepository") private readonly repository: ITicketIssuerRepository,
    @inject("TicketIssuerConverter") private readonly converter: TicketIssuerConverter,
  ) {}

  async findTicketIssuer(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
  }

  async findTicketIssuerOrThrow(ctx: IContext, id: string) {
    const issuer = await this.repository.find(ctx, id);
    if (!issuer) {
      throw new NotFoundError("TicketIssuer", { id });
    }
    return issuer;
  }

  async issueTicket(ctx: IContext, userId: string, utilityId: string, qtyToBeIssued: number) {
    const data = this.converter.issue(userId, utilityId, qtyToBeIssued);
    return ctx.issuer.public(ctx, async (tx) => {
      return this.repository.create(ctx, data, tx);
    });
  }
}
