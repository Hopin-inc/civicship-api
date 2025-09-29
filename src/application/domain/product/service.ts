import { injectable, inject } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IProductService } from "./data/interface";
import ProductRepository from "./data/repository";
import { PrismaProduct } from "./data/type";

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
    if (!product.nftProduct.stripeProductId) {
      throw new Error(`NFT product missing stripeProductId: ${productId}`);
    }

    if (!product.nftProduct.nmkrProjectId) {
      throw new Error(`NFT product missing nmkrProjectId: ${productId}`);
    }
  }
}
