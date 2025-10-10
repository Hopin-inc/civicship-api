import { injectable } from "tsyringe";
import { GqlProduct, GqlProductBuySuccess } from "@/types/graphql";
import { PrismaProduct } from "./data/type";

@injectable()
export default class ProductPresenter {
  static get(product: PrismaProduct): GqlProduct {
    return {
      __typename: "Product",
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.price,
      type: product.type,
      remainingSupply: 0,
      maxSupply: product.maxSupply,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static create(paymentUrl: string): GqlProductBuySuccess {
    return {
      __typename: "ProductBuySuccess",
      paymentLink: paymentUrl,
    };
  }
}
