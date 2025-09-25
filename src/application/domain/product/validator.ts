import { PrismaProduct } from "@/application/domain/product/data/type";
import { OrderValidationError, ProductNotFoundError } from "@/application/domain/order/errors";

export default class ProductValidator {
  static ensureIsValidForOrder(
    product: PrismaProduct | null,
    productId: string,
  ): asserts product is PrismaProduct {
    if (!product) {
      throw new ProductNotFoundError(productId);
    }
    if (product.type !== "NFT") {
      throw new OrderValidationError(`Product is not an NFT: ${productId}`);
    }
    if (!product.nftProduct) {
      throw new OrderValidationError(`NFT product not found for product: ${productId}`);
    }
    if (!product.nftProduct.externalRef) {
      throw new OrderValidationError(`NFT product missing externalRef: ${productId}`);
    }
  }
}
