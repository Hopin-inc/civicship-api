import { IContext } from "@/types/server";
import TicketIssuerRepository from "@/application/domain/reward/ticketIssuer/data/repository";
import { NotFoundError } from "@/errors/graphql";
import { PrismaTicketIssuer } from "@/application/domain/reward/ticketIssuer/data/type";
import TicketIssuerConverter from "@/application/domain/reward/ticketIssuer/data/converter";

export default class TicketIssuerService {
  static async findTicketIssuer(ctx: IContext, id: string): Promise<PrismaTicketIssuer | null> {
    return await TicketIssuerRepository.find(ctx, id);
  }

  static async findTicketIssuerOrThrow(ctx: IContext, id: string): Promise<PrismaTicketIssuer> {
    const issuer = await TicketIssuerRepository.find(ctx, id);
    if (!issuer) {
      throw new NotFoundError("TicketIssuer", { id });
    }
    return issuer;
  }

  static async issueTicket(ctx: IContext, userId: string, utilityId: string, qty: number) {
    const data = TicketIssuerConverter.issue(userId, utilityId, qty);
    return TicketIssuerRepository.create(ctx, data);
  }
}
