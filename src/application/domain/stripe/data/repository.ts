import { injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IStripeEventRepository } from "./interface";
import logger from "@/infrastructure/logging";

@injectable()
export default class StripeEventRepository implements IStripeEventRepository {
  async findByEventId(
    ctx: IContext,
    eventId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string; eventId: string } | null> {
    const queryFn = async (prisma: Prisma.TransactionClient) => {
      return (prisma as any).stripeEvent.findUnique({
        where: { eventId },
        select: { id: true, eventId: true },
      });
    };

    if (tx) {
      return queryFn(tx);
    }

    return ctx.issuer.public(ctx, queryFn);
  }

  async create(
    ctx: IContext,
    data: {
      eventId: string;
      eventType: string;
      orderId?: string;
    },
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string; eventId: string }> {
    try {
      const event = await (tx as any).stripeEvent.create({
        data: {
          eventId: data.eventId,
          eventType: data.eventType,
          orderId: data.orderId,
        },
        select: { id: true, eventId: true },
      });

      logger.debug("[StripeEventRepository] Created event record", {
        eventId: data.eventId,
        eventType: data.eventType,
        orderId: data.orderId,
      });

      return event;
    } catch (error) {
      if (error instanceof Error && error.message.includes('P2002')) {
        logger.warn("[StripeEventRepository] Duplicate event detected", {
          eventId: data.eventId,
        });
        
        const existing = await (tx as any).stripeEvent.findUnique({
          where: { eventId: data.eventId },
          select: { id: true, eventId: true },
        });
        
        if (!existing) {
          throw error;
        }
        
        return existing;
      }
      throw error;
    }
  }
}
