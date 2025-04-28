import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { PrismaTicketIssuer } from "@/application/domain/reward/ticketIssuer/data/type";
import { ITicketIssuerRepository, ITicketIssuerService } from "./data/interface";
import { NotFoundError } from "@/errors/graphql";
import TicketIssuerConverter from "@/application/domain/reward/ticketIssuer/data/converter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

@injectable()
export default class TicketIssuerService implements ITicketIssuerService {
  constructor(
    @inject("ITicketIssuerRepository") private readonly repository: ITicketIssuerRepository,
    @inject("TicketIssuerConverter") private readonly converter: TicketIssuerConverter,
    @inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer,
  ) { }

  async findTicketIssuer(ctx: IContext, id: string): Promise<PrismaTicketIssuer | null> {
    return await this.repository.find(ctx, id);
  }

  async findTicketIssuerOrThrow(ctx: IContext, id: string): Promise<PrismaTicketIssuer> {
    const issuer = await this.repository.find(ctx, id);
    if (!issuer) {
      throw new NotFoundError("TicketIssuer", { id });
    }
    return issuer;
  }

  async issueTicket(
    ctx: IContext,
    userId: string,
    utilityId: string,
    qtyToBeIssued: number,
  ): Promise<PrismaTicketIssuer> {
    const data = this.converter.issue(userId, utilityId, qtyToBeIssued);
    return this.issuer.public(ctx, async (tx) => {
      return this.repository.create(ctx, data, tx);
    });
  }
}
