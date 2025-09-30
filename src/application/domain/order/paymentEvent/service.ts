import { injectable, inject } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import {
  IPaymentEventRepository,
  IPaymentEventService,
} from "@/application/domain/order/paymentEvent/data/interface";

@injectable()
export default class PaymentEventService implements IPaymentEventService {
  constructor(
    @inject("PaymentEventRepository") private readonly repository: IPaymentEventRepository,
  ) {}

  async ensureEventIdempotency(
    ctx: IContext,
    eventId: string,
    eventType: string,
    orderId?: string,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    if (tx) {
      return this.ensureEventIdempotencyInternal(ctx, eventId, eventType, orderId, tx);
    }
    return ctx.issuer.internal((prisma) =>
      this.ensureEventIdempotencyInternal(ctx, eventId, eventType, orderId, prisma),
    );
  }

  private async ensureEventIdempotencyInternal(
    ctx: IContext,
    eventId: string,
    eventType: string,
    orderId: string | undefined,
    tx: Prisma.TransactionClient,
  ): Promise<boolean> {
    const existing = await this.repository.findByEventId(ctx, eventId, tx);
    if (existing) {
      logger.info("[PaymentEventService] Event already processed", { eventId });
      return false;
    }

    try {
      await this.repository.create(ctx, { eventId, eventType, orderId }, tx);
      logger.info("[PaymentEventService] Event registered", { eventId, eventType, orderId });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          logger.warn("[PaymentEventService] Duplicate detected after race", { eventId });
          return false;
        }
      }
      throw error;
    }
  }
}
