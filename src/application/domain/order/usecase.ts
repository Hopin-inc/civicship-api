import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { GqlOrderCreateInput, GqlOrderCreatePayload } from '@/types/graphql';
import { getCurrentUserId } from '@/application/domain/utils';
import { buildCustomProps } from '@/infrastructure/libs/nmkr/customProps';
import { NmkrClient } from '@/infrastructure/libs/nmkr/api/client';
import logger from '@/infrastructure/logging';
import OrderService from './service';
import ProductService from '@/application/domain/product/service';
import OrderPresenter from './presenter';
import { 
  OrderValidationError, 
  InsufficientInventoryError, 
  ProductNotFoundError 
} from './errors';

interface OrderCreateArgs {
  input: GqlOrderCreateInput;
}

@injectable()
export default class OrderUseCase {
  constructor(
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("ProductService") private readonly productService: ProductService,
    @inject("NmkrClient") private readonly nmkrClient: NmkrClient,
  ) {}

  async createOrder(
    ctx: IContext,
    args: OrderCreateArgs
  ): Promise<GqlOrderCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);
    const { productId, quantity, receiverAddress } = args.input;

    logger.info("Order creation initiated", {
      userId: currentUserId,
      productId,
      quantity,
      receiverAddress
    });

    try {
      let order;
      
      await ctx.issuer.internal(async (tx) => {
        const product = await this.productService.validateProductForOrder(ctx, productId, tx);
        
        const inventory = await this.productService.calculateInventory(ctx, productId, tx);
        if (inventory.maxSupply != null && inventory.available < quantity) {
          throw new InsufficientInventoryError(
            `Insufficient inventory. Available: ${inventory.available}, Requested: ${quantity}`,
            productId,
            inventory.available,
            quantity
          );
        }
        
        await this.productService.reserveInventory(ctx, [{ productId, quantity }], tx);
        
        order = await this.orderService.create(ctx, {
          userId: currentUserId,
          items: [{ productId, quantity, priceSnapshot: product.price }],
        }, tx);
      });

      logger.info("Order created successfully", {
        orderId: order.id,
        userId: currentUserId,
        totalAmount: order.totalAmount
      });

      const orderItem = order.items[0];
      const customProps = {
        propsVersion: 1 as const,
        orderId: order.id,
        orderItemId: orderItem.id,
        userRef: currentUserId,
        receiverAddress
      };

      logger.info("Requesting NMKR payment address", {
        orderId: order.id,
        orderItemId: orderItem.id,
        externalRef: orderItem.product.nftProduct!.externalRef
      });

      const paymentResponse = await this.nmkrClient.getPaymentAddressForSpecificNftSale(
        orderItem.product.nftProduct!.externalRef!,
        1,
        orderItem.priceSnapshot.toString(),
        buildCustomProps(customProps),
        receiverAddress
      );

      if (!paymentResponse.paymentAddress || !paymentResponse.paymentAddressId) {
        throw new OrderValidationError('NMKR payment address not received');
      }

      const externalRef = paymentResponse.paymentAddressId.toString();
      const updatedOrder = await this.orderService.updateOrderWithExternalRef(ctx, order.id, externalRef);

      logger.info("Order creation completed", {
        orderId: order.id,
        paymentAddress: paymentResponse.paymentAddress,
        paymentAddressId: paymentResponse.paymentAddressId
      });

      return {
        __typename: 'OrderCreateSuccess',
        order: OrderPresenter.toGraphQL(updatedOrder),
        customProperty: JSON.stringify(customProps),
        paymentAddress: paymentResponse.paymentAddress,
        paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        totalAmount: updatedOrder.totalAmount!,
      };
    } catch (error) {
      logger.warn('Order creation failed', { 
        userId: currentUserId, 
        productId,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      if (error instanceof InsufficientInventoryError) {
        return {
          __typename: 'OrderCreateError',
          message: error.message,
          code: 'INSUFFICIENT_INVENTORY'
        };
      }
      
      if (error instanceof ProductNotFoundError) {
        return {
          __typename: 'OrderCreateError',
          message: error.message,
          code: 'PRODUCT_NOT_FOUND'
        };
      }
      
      return {
        __typename: 'OrderCreateError',
        message: 'Order creation failed',
        code: 'INTERNAL_ERROR'
      };
    }
  }
}
