import { injectable } from 'tsyringe';
import { GqlOrder, GqlOrderItem } from '@/types/graphql';
import { OrderWithItems, OrderItemWithProduct } from './type';
import UserPresenter from '@/application/domain/account/user/presenter';
import ProductPresenter from '@/application/domain/product/presenter';

@injectable()
export default class OrderPresenter {
  static toGraphQL(order: OrderWithItems): GqlOrder {
    return {
      __typename: 'Order',
      id: order.id,
      status: order.status as any, // Cast to handle enum differences between Prisma and GraphQL
      paymentProvider: order.paymentProvider,
      externalRef: order.externalRef,
      totalAmount: order.totalAmount!,
      user: UserPresenter.get(order.user),
      items: order.items.map(item => OrderPresenter.toGraphQLOrderItem(item)),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }

  static toGraphQLOrderItem(item: OrderItemWithProduct): GqlOrderItem {
    return {
      __typename: 'OrderItem',
      id: item.id,
      priceSnapshot: item.priceSnapshot,
      quantity: item.quantity,
      product: ProductPresenter.toGraphQL(item.product),
      nftMints: [], // Simplified for now - will be populated by proper NftMint presenter when needed
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }
}
