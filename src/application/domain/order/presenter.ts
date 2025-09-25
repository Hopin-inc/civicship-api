import { injectable } from "tsyringe";
import { GqlOrder, GqlOrderCreatePayload, GqlOrderItem, GqlOrderStatus } from "@/types/graphql";
import { OrderWithItems, OrderItemWithProduct } from "./data/type";
import UserPresenter from "@/application/domain/account/user/presenter";
import ProductPresenter from "@/application/domain/product/presenter";

@injectable()
export default class OrderPresenter {
  static createOrderPayload(p: {
    order: OrderWithItems;
    paymentUid: string;
    customProps: Record<string, unknown>;
  }): GqlOrderCreatePayload {
    return {
      __typename: "OrderCreateSuccess",
      order: this.create(p.order),
      paymentLink: `https://nmkr.io/pay/${p.paymentUid}`,
      paymentProvider: "NMKR_PAY" as const,
      paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h後
      totalAmount: p.order.totalAmount!,
      currency: "JPY",
      customProperty: JSON.stringify(p.customProps),
    };
  }

  static create(order: OrderWithItems): GqlOrder {
    return {
      __typename: "Order",
      id: order.id,
      status: order.status as GqlOrderStatus,
      paymentProvider: order.paymentProvider,
      externalRef: order.externalRef,
      totalAmount: order.totalAmount!,
      user: UserPresenter.get(order.user),
      items: order.items.map((item) => OrderPresenter.get(item)),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  static get(item: OrderItemWithProduct): GqlOrderItem {
    return {
      __typename: "OrderItem",
      id: item.id,
      priceSnapshot: item.priceSnapshot,
      quantity: item.quantity,
      product: ProductPresenter.get(item.product),
      nftMints: [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
