import { PrismaProduct } from "@/application/domain/product/data/type";

export default class ProductValidator {
  static ensureIsValidForOrder(
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
    if (!product.nftProduct.externalRef) {
      throw new Error(`NFT product missing externalRef: ${productId}`);
    }
  }
}
