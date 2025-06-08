import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlTicketIssuer } from "@/types/graphql";
import TicketIssuerPresenter from "@/application/domain/reward/ticketIssuer/presenter";
import {
  PrismaTicketIssuer,
  ticketIssuerInclude,
} from "@/application/domain/reward/ticketIssuer/data/type";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

export function createTicketIssuerLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<PrismaTicketIssuer, GqlTicketIssuer>(
    async (ids) =>
      issuer.internal((tx) =>
        tx.ticketIssuer.findMany({
          where: { id: { in: [...ids] } },
          include: ticketIssuerInclude,
        }),
      ),
    TicketIssuerPresenter.get,
  );
}
