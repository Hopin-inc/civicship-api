import { injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IProductRepository } from "./interface";
import { productSelect, PrismaProduct } from "./type";

@injectable()
export default class ProductRepository implements IProductRepository {
  async query(
    ctx: IContext,
    productIds: string[],
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct[]> {
    if (tx) {
      return tx.product.findMany({
        where: { id: { in: productIds } },
        select: productSelect,
      });
    }
    return ctx.issuer.public(ctx, (transaction) =>
      transaction.product.findMany({
        where: { id: { in: productIds } },
        select: productSelect,
      }),
    );
  }

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

  async findMaxSupplyById(
    ctx: IContext,
    productId: string,
    tx: Prisma.TransactionClient,
  ): Promise<{ maxSupply: number | null } | null> {
    return tx.product.findUnique({
      where: { id: productId },
      select: { maxSupply: true },
    });
  }

  async calculateInventoryAtomic(
    ctx: IContext,
    productId: string,
    tx: Prisma.TransactionClient,
  ): Promise<{
    maxSupply: number | null;
    reserved: number;
    soldPendingMint: number;
    minted: number;
  } | null> {
    const result = await tx.$queryRaw<
      {
        max_supply: number | null;
        reserved: number;
        sold_pending_mint: number;
        minted: number;
      }[]
    >`
      WITH inventory_counts AS (
        SELECT 
          p.max_supply,
          -- Reserved: PENDING orders
          COALESCE(SUM(
            CASE WHEN o.status = 'PENDING' 
            THEN oi.quantity ELSE 0 END
          ), 0) as reserved,
          
          -- Sold Pending Mint: PAID orders with incomplete minting (including FAILED as lost)
          COALESCE(SUM(
            CASE WHEN o.status = 'PAID' 
                 AND (nm.status IS NULL OR nm.status IN ('QUEUED', 'SUBMITTED', 'FAILED'))
            THEN oi.quantity ELSE 0 END
          ), 0) as sold_pending_mint,
          
          -- Minted: Successfully completed mints
          COALESCE(SUM(
            CASE WHEN nm.status = 'MINTED' 
            THEN oi.quantity ELSE 0 END
          ), 0) as minted
          
        FROM t_products p
        LEFT JOIN t_order_items oi ON oi.product_id = p.id
        LEFT JOIN t_orders o ON o.id = oi.order_id
        LEFT JOIN t_nft_mints nm ON nm.order_item_id = oi.id
        WHERE p.id = ${productId}
        GROUP BY p.id, p.max_supply
      )
      SELECT * FROM inventory_counts
    `;

    if (result.length === 0) {
      return null;
    }

    const data = result[0];
    return {
      maxSupply: data.max_supply === null ? null : Number(data.max_supply),
      reserved: Number(data.reserved),
      soldPendingMint: Number(data.sold_pending_mint),
      minted: Number(data.minted),
    };
  }
}
