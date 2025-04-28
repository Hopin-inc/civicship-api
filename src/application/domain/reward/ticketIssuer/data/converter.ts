import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class TicketIssuerConverter {
  issue(userId: string, utilityId: string, qty: number): Prisma.TicketIssuerCreateInput {
    return {
      qtyToBeIssued: qty,
      utility: { connect: { id: utilityId } },
      owner: { connect: { id: userId } },
    };
  }
}
