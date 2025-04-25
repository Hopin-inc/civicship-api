import { Prisma } from "@prisma/client";

export default class TicketIssuerConverter {
  static issue(userId: string, utilityId: string, qty: number): Prisma.TicketIssuerCreateInput {
    return {
      qtyToBeIssued: qty,
      utility: { connect: { id: utilityId } },
      owner: { connect: { id: userId } },
    };
  }
}
