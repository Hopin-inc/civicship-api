import { injectable } from "tsyringe";
import { Prisma, OrderStatus, NftMintStatus } from "@prisma/client";

@injectable()
export default class OrderItemConverter {
  reservedByProduct(productId: string): Prisma.OrderItemWhereInput {
    return {
      productId,
      order: { status: OrderStatus.PENDING },
    };
  }

  soldPendingMintByProduct(productId: string): Prisma.OrderItemWhereInput {
    return {
      productId,
      order: { status: OrderStatus.PAID },
      nftMints: {
        some: { status: { in: [NftMintStatus.SUBMITTED] } },
      },
    };
  }
}
