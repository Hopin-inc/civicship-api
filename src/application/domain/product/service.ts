import { injectable, inject } from "tsyringe";
import { Prisma, Provider } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaProduct } from "@/application/domain/product/data/type";
import { IProductService } from "@/application/domain/product/data/interface";
import ProductRepository from "@/application/domain/product/data/repository";

@injectable()
export default class ProductService implements IProductService {
  constructor(@inject("ProductRepository") private readonly repository: ProductRepository) {}

  async findOrThrowForOrder(
    ctx: IContext,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaProduct> {
    const product = await this.repository.find(ctx, productId, tx);
    this.ensureIsValidForOrder(product, productId);

    return product;
  }

  private ensureIsValidForOrder(
    product: PrismaProduct | null,
    productId: string,
  ): asserts product is PrismaProduct {
    if (!product) {
      throw new Error(productId);
    }
    if (product.type !== "NFT") {
      throw new Error(`Product is not an NFT: ${productId}`);
    }
    if (!product.nftProduct) {
      throw new Error(`NFT product not found for product: ${productId}`);
    }
    if (!product.integrations || product.integrations.length === 0) {
      throw new Error(`No integrations found for product: ${productId}`);
    }
    const stripeIntegration = product.integrations.find((i) => i.provider === Provider.STRIPE);
    const nmkrIntegration = product.integrations.find((i) => i.provider === Provider.NMKR);

    if (!stripeIntegration) {
      throw new Error(`Missing STRIPE integration for product: ${productId}`);
    }

    if (!nmkrIntegration) {
      throw new Error(`Missing NMKR integration for product: ${productId}`);
    }
  }
}
