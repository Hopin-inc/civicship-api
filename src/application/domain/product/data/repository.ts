import { injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IProductRepository } from "./interface";
import { productSelect, PrismaProduct } from "./type";

@injectable()
export default class ProductRepository implements IProductRepository {
  async find(
    ctx: IContext,
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct | null> {
    if (tx) {
      return tx.product.findUnique({
        where: { id },
        select: productSelect,
      });
    }
    return ctx.issuer.public(ctx, (transaction) => {
      return transaction.product.findUnique({
        where: { id },
        select: productSelect,
      });
    });
  }
}
