import { injectable } from "tsyringe";
import { Prisma, Provider } from "@prisma/client";
import { IContext } from "@/types/server";
import { IPaymentEventRepository } from "@/application/domain/order/paymentEvent/data/interface";

@injectable()
export default class PaymentEventRepository implements IPaymentEventRepository {
  async findByEventId(
    ctx: IContext,
    eventId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string; eventId: string } | null> {
    if (tx) {
      return tx.paymentEvent.findUnique({
        where: { provider_eventId: { eventId, provider: Provider.STRIPE } },
        select: { id: true, eventId: true },
      });
    }

    return ctx.issuer.internal((dbTx) => {
      return dbTx.paymentEvent.findUnique({
        where: { provider_eventId: { eventId, provider: Provider.STRIPE } },
        select: { id: true, eventId: true },
      });
    });
  }

  async create(
    ctx: IContext,
    data: { eventId: string; eventType: string; orderId?: string },
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string; eventId: string }> {
    return tx.paymentEvent.create({
      data,
      select: { id: true, eventId: true },
    });
  }
}
