import { injectable } from "tsyringe";
import { GqlProduct, GqlProductBuySuccess } from "@/types/graphql";
import { PrismaProduct } from "./data/type";

@injectable()
export default class ProductPresenter {
  static get(product: PrismaProduct, stockNftInstancesCount: number): GqlProduct {
    const remainingSupply = product.maxSupply ? product.maxSupply - stockNftInstancesCount : 0;

    return {
      __typename: "Product",
      ...product,
      remainingSupply,
    };
  }

  static create(paymentUrl: string): GqlProductBuySuccess {
    return {
      __typename: "ProductBuySuccess",
      paymentLink: paymentUrl,
    };
  }
}
