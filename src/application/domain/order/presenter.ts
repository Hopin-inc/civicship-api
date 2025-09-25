import { injectable } from "tsyringe";
import { GqlOrder, GqlOrderItem, GqlOrderStatus } from "@/types/graphql";
import { OrderWithItems, OrderItemWithProduct } from "./data/type";
import UserPresenter from "@/application/domain/account/user/presenter";
import ProductPresenter from "@/application/domain/product/presenter";

@injectable()
export default class OrderPresenter {
  static create(order: OrderWithItems): GqlOrder {
    return {
      __typename: "Order",
      id: order.id,
      status: order.status as GqlOrderStatus,
      paymentProvider: order.paymentProvider,
      externalRef: order.externalRef,
      totalAmount: order.totalAmount!,
      user: UserPresenter.get(order.user),
      items: order.items.map((item) => OrderPresenter.toGraphQLOrderItem(item)),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  static toGraphQLOrderItem(item: OrderItemWithProduct): GqlOrderItem {
    return {
      __typename: "OrderItem",
      id: item.id,
      priceSnapshot: item.priceSnapshot,
      quantity: item.quantity,
      product: ProductPresenter.toGraphQL(item.product),
      nftMints: [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
