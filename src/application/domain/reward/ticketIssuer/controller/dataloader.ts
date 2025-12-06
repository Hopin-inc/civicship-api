import { PrismaClient } from "@prisma/client";
import { GqlTicketIssuer } from "@/types/graphql";
import TicketIssuerPresenter from "@/application/domain/reward/ticketIssuer/presenter";
import {
  PrismaTicketIssuerDetail,
  ticketIssuerSelectDetail,
} from "@/application/domain/reward/ticketIssuer/data/type";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

export function createTicketIssuerLoader(prisma: PrismaClient) {
  return createLoaderById<PrismaTicketIssuerDetail, GqlTicketIssuer>(
    async (ids) =>
      prisma.ticketIssuer.findMany({
        where: { id: { in: [...ids] } },
        select: ticketIssuerSelectDetail,
      }),
    TicketIssuerPresenter.get,
  );
}
