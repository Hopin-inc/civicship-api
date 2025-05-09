import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlTicketIssuer } from "@/types/graphql";
import TicketIssuerPresenter from "@/application/domain/reward/ticketIssuer/presenter";
import {
  PrismaTicketIssuerDetail,
  ticketIssuerSelectDetail,
} from "@/application/domain/reward/ticketIssuer/data/type";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

export function createTicketIssuerLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaTicketIssuerDetail, GqlTicketIssuer>(
    async (ids) =>
      issuer.internal((tx) =>
        tx.ticketIssuer.findMany({
          where: { id: { in: [...ids] } },
          select: ticketIssuerSelectDetail,
        }),
      ),
    TicketIssuerPresenter.get,
  );
}
