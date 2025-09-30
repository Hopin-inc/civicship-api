import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export interface IPaymentEventRepository {
  findByEventId(
    ctx: IContext,
    eventId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string; eventId: string } | null>;

  create(
    ctx: IContext,
    data: {
      eventId: string;
      eventType: string;
      orderId?: string;
    },
    tx: Prisma.TransactionClient,
  ): Promise<{ id: string; eventId: string }>;
}

export interface IPaymentEventService {
  ensureEventIdempotency(
    ctx: IContext,
    eventId: string,
    eventType: string,
    orderId?: string,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean>;
}
