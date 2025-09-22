import { injectable } from 'tsyringe';
import { OrderWithItems, OrderItemWithProduct } from './type';

@injectable()
export default class OrderPresenter {
  static toGraphQL(order: OrderWithItems) {
    return {
      id: order.id,
      status: order.status,
      paymentProvider: order.paymentProvider,
      externalRef: order.externalRef,
      totalAmount: order.totalAmount!,
      user: order.user,
      items: order.items.map(item => OrderPresenter.toGraphQLOrderItem(item)),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }

  static toGraphQLOrderItem(item: OrderItemWithProduct) {
    return {
      id: item.id,
      priceSnapshot: item.priceSnapshot,
      quantity: item.quantity,
      product: item.product,
      nftMints: item.nftMints,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }
}
