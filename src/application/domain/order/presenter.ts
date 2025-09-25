import { injectable } from "tsyringe";
import { GqlOrder, GqlOrderCreateError, GqlOrderItem, GqlOrderStatus } from "@/types/graphql";
import { OrderWithItems, OrderItemWithProduct } from "./data/type";
import UserPresenter from "@/application/domain/account/user/presenter";
import ProductPresenter from "@/application/domain/product/presenter";
import {
  InsufficientInventoryError,
  NmkrApiError,
  OrderValidationError,
  ProductNotFoundError,
} from "@/application/domain/order/errors";

@injectable()
export default class OrderPresenter {
  static toGraphQL(order: OrderWithItems): GqlOrder {
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

  static error(error: unknown): GqlOrderCreateError {
    if (error instanceof InsufficientInventoryError) {
      return {
        __typename: "OrderCreateError",
        message: error.message,
        code: "INSUFFICIENT_INVENTORY",
      };
    }
    if (error instanceof ProductNotFoundError) {
      return { __typename: "OrderCreateError", message: error.message, code: "PRODUCT_NOT_FOUND" };
    }
    if (error instanceof OrderValidationError || error instanceof NmkrApiError) {
      return { __typename: "OrderCreateError", message: error.message, code: error.code };
    }
    return {
      __typename: "OrderCreateError",
      message: "Order creation failed",
      code: "INTERNAL_ERROR",
    };
  }
}
