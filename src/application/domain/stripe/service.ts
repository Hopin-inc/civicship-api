import { injectable, inject } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IStripeEventService, IStripeEventRepository } from "./data/interface";
import logger from "@/infrastructure/logging";

@injectable()
export default class StripeEventService implements IStripeEventService {
  constructor(
    @inject("StripeEventRepository") private readonly repository: IStripeEventRepository,
  ) {}

  async ensureEventIdempotency(
    ctx: IContext,
    eventId: string,
    eventType: string,
    orderId?: string,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const processFn = async (prisma: Prisma.TransactionClient) => {
      const existing = await this.repository.findByEventId(ctx, eventId, prisma);
      
      if (existing) {
        logger.info("[StripeEventService] Event already processed", {
          eventId,
          existingId: existing.id,
        });
        return false;
      }

      await this.repository.create(ctx, { eventId, eventType, orderId }, prisma);
      
      logger.info("[StripeEventService] Event registered for processing", {
        eventId,
        eventType,
        orderId,
      });
      
      return true;
    };

    if (tx) {
      return processFn(tx);
    }

    return ctx.issuer.internal(processFn);
  }
}
